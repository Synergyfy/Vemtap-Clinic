import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Invoice } from '../entities/invoice.entity';
import { PatientPortalService } from './patient-portal.service';
import { PatientPortalController } from './patient-portal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, MedicalRecord, Invoice]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PatientPortalService],
  controllers: [PatientPortalController],
})
export class PatientPortalModule {}
