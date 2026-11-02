import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto, RegisterDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { generateOpaqueToken, sha256Hex } from './utils/crypto.util';

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
  clinicId: string | null;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  private readonly passwordResetTokens = new Map<string, { email: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, reqInfo?: { userAgent?: string; ip?: string }): Promise<{ tokens: TokenPair; user: AuthUser }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      email: normalizedEmail,
      role: UserRole.ADMIN,
      clinicId: dto.clinicId ?? null,
      password: hashedPassword,
      isActive: true,
    });
    const saved = await this.userRepository.save(user);

    return this.generateTokens(saved, reqInfo);
  }

  async login(dto: LoginDto, reqInfo?: { userAgent?: string; ip?: string }): Promise<{ tokens: TokenPair; user: AuthUser }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.userRepository.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.password',
        'user.role',
        'user.clinicId',
        'user.isActive',
      ])
      .getOne();

    if (!user) {
      await bcrypt.compare(dto.password, '$2b$10$dummyhashdummyhashdummyhashdummyha');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user, reqInfo);
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user as any;
    return result;
  }

  async refreshTokens(
    refreshToken: string,
    reqInfo?: { userAgent?: string; ip?: string },
  ): Promise<{ tokens: TokenPair; user: AuthUser }> {
    const tokenHash = sha256Hex(refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.isRevoked()) {
      if (storedToken.replacedBy) {
        await this.revokeAllUserTokens(storedToken.userId);
        throw new UnauthorizedException('Token reuse detected — all sessions revoked');
      }
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (storedToken.isExpired()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!storedToken.user || !storedToken.user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const newTokens = await this.rotateRefreshToken(storedToken, reqInfo);

    return {
      tokens: newTokens,
      user: this.mapUserToAuthUser(storedToken.user),
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      return { message: 'Logged out successfully' };
    }

    const tokenHash = sha256Hex(refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({ where: { tokenHash } });

    if (storedToken) {
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);
    }

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'password'] });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    await this.revokeAllUserTokens(userId);

    return { message: 'Password changed successfully — all sessions revoked' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string; resetUrl?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.findUserByEmail(normalizedEmail);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    for (const [token, value] of this.passwordResetTokens.entries()) {
      if (value.email === normalizedEmail) {
        this.passwordResetTokens.delete(token);
      }
    }

    const resetToken = generateOpaqueToken();
    const resetUrl = this.buildResetUrl(normalizedEmail, resetToken);

    this.passwordResetTokens.set(resetToken, {
      email: normalizedEmail,
      expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
    });

    const mailResult = await this.sendPasswordResetEmail(normalizedEmail, resetUrl);

    if (mailResult.sent) {
      return {
        message: 'If the email exists, a reset link has been sent',
        resetToken,
      };
    }

    return {
      message: 'Password reset link generated for local testing. Check the API logs for the reset URL.',
      resetToken,
      resetUrl,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const resetToken = this.passwordResetTokens.get(dto.token);

    if (!resetToken || resetToken.email !== normalizedEmail || Date.now() > resetToken.expiresAt) {
      this.passwordResetTokens.delete(dto.token);
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
    this.passwordResetTokens.delete(dto.token);

    await this.revokeAllUserTokens(user.id);

    return { message: 'Password reset successfully — all sessions revoked' };
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: email.toLowerCase() })
      .getOne();
  }

  private buildResetUrl(email: string, token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const params = new URLSearchParams({ email, token });
    return `${frontendUrl.replace(/\/$/, '')}/forgot-password?${params.toString()}`;
  }

  private async sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ sent: boolean; resetUrl?: string }> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpFrom = this.configService.get<string>('SMTP_FROM', 'noreply@localhost');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.warn(`[Password Reset] SMTP is not configured. Local reset URL: ${resetUrl}`);
      return { sent: false, resetUrl };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Reset your Vemtap Clinic password',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset for your Vemtap Clinic account.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    return { sent: true, resetUrl };
  }

  private async generateTokens(
    user: User,
    reqInfo?: { userAgent?: string; ip?: string },
  ): Promise<{ tokens: TokenPair; user: AuthUser }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = sha256Hex(refreshToken);

    const expiresIn = this.parseDuration(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'));
    const expiresAt = new Date(Date.now() + expiresIn);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      tokenHash: refreshTokenHash,
      userId: user.id,
      clinicId: user.clinicId,
      expiresAt,
      userAgent: reqInfo?.userAgent ?? null,
      ip: reqInfo?.ip ?? null,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      tokens: { accessToken, refreshToken },
      user: this.mapUserToAuthUser(user),
    };
  }

  private async rotateRefreshToken(
    oldToken: RefreshToken,
    reqInfo?: { userAgent?: string; ip?: string },
  ): Promise<TokenPair> {
    const newRefreshToken = generateOpaqueToken();
    const newRefreshTokenHash = sha256Hex(newRefreshToken);

    const expiresIn = this.parseDuration(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'));
    const expiresAt = new Date(Date.now() + expiresIn);

    const newTokenEntity = this.refreshTokenRepository.create({
      tokenHash: newRefreshTokenHash,
      userId: oldToken.userId,
      clinicId: oldToken.clinicId ?? undefined,
      expiresAt,
      userAgent: reqInfo?.userAgent ?? null,
      ip: reqInfo?.ip ?? null,
    });

    oldToken.revokedAt = new Date();
    oldToken.replacedBy = newTokenEntity.id;

    await this.refreshTokenRepository.save([oldToken, newTokenEntity]);

    const accessToken = this.generateAccessToken(oldToken.user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      user_id: user.id,
      userId: user.id,
      roles: [user.role],
    };
    return this.jwtService.sign(payload);
  }

  private mapUserToAuthUser(user: User): AuthUser {
    return {
      userId: user.id,
      email: user.email,
      roles: [user.role],
      clinicId: user.clinicId,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private parseDuration(input: string): number {
    const match = input.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] ?? 1);
  }
}