import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from '../entities/patient.entity';
import { Clinic } from '../entities/clinic.entity';
import { Branch } from '../entities/branch.entity';
import { Appointment } from '../entities/appointment.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Invoice } from '../entities/invoice.entity';
import { PatientClinicMembership } from '../entities/patient-clinic-membership.entity';
import { PatientFamilyInvitation } from '../entities/patient-family-invitation.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { PatientPortalService } from './patient-portal.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PatientPortalController } from './patient-portal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Clinic, Branch, Appointment, MedicalRecord, Invoice, PatientClinicMembership, PatientFamilyInvitation, LensOrder]),
    NotificationsModule,
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
