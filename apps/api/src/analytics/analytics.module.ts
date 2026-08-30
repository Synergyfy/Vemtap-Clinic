import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Expense } from '../entities/expense.entity';
import { Appointment } from '../entities/appointment.entity';
import { QueueEntry } from '../entities/queue-entry.entity';
import { Staff } from '../entities/staff.entity';
import { Patient } from '../entities/patient.entity';
import { OpticalSale } from '../entities/optical-sale.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment, Expense, Appointment, QueueEntry, Staff, Patient, OpticalSale])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
