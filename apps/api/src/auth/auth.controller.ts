import { Controller, Post, Get, Put, Body, Res, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ResetPasswordDto, RefreshTokenDto, AuthUserDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { getRefreshCookieOptions, getClearedRefreshCookieOptions, REFRESH_COOKIE_NAME } from './utils/refresh-cookie.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { tokens, user } = await this.authService.register(dto, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { tokens, user } = await this.authService.login(dto, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token from cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto | Response> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token not found' });
    }

    const { tokens, user } = await this.authService.refreshTokens(refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user — revokes refresh token and clears cookie' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(refreshToken ?? '');
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password — revokes all user sessions' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password via email token — revokes all sessions' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: AuthUserDto) {
    return user;
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions(this.configService));
  }

  private clearRefreshCookie(res: Response) {
    res.cookie(REFRESH_COOKIE_NAME, '', getClearedRefreshCookieOptions());
  }
}