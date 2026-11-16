import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { HMOPlan } from '../entities/hmo-plan.entity';
import { PatientClinicMembership } from '../entities/patient-clinic-membership.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, HMOPlan, PatientClinicMembership]), SubscriptionsModule],
  providers: [PatientsService],
  controllers: [PatientsController],
  exports: [PatientsService],
})
export class PatientsModule {}
