import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { QueueEntry } from '../entities/queue-entry.entity';
import { Invoice } from '../entities/invoice.entity';
import { Staff } from '../entities/staff.entity';
import { HMOClaim } from '../entities/hmo-claim.entity';
import { Drug } from '../entities/drug.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Appointment, QueueEntry, Invoice, Staff, HMOClaim, Drug])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
