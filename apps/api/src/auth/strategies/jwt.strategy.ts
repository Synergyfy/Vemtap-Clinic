import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Patient } from '../../entities/patient.entity';

export interface JwtPayload {
  sub?: string;
  user_id?: string;
  userId?: string;
  roles?: string[];
  type?: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub ?? payload.user_id ?? payload.userId;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.type === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { id: userId } });
      if (!patient || !patient.portalAccessEnabled) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        sub: patient.id,
        userId: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        roles: ['patient'],
        clinicId: patient.clinicId ?? null,
        branchId: patient.branchId ?? null,
        type: 'patient',
      };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      sub: user.id,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: [user.role],
      clinicId: user.clinicId,
      type: 'user',
    };
  }
}