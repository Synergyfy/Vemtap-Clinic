import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debtor } from '../entities/debtor.entity';
import { PaymentPlan } from '../entities/payment-plan.entity';
import { PaymentPlanInstallment } from '../entities/payment-plan-installment.entity';
import { CollectionActivity } from '../entities/collection-activity.entity';
import { Patient } from '../entities/patient.entity';
import { HMO } from '../entities/hmo.entity';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Staff } from '../entities/staff.entity';
import { Clinic } from '../entities/clinic.entity';
import { DebtorsService } from './debtors.service';
import { DebtorsController } from './debtors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Debtor, PaymentPlan, PaymentPlanInstallment, CollectionActivity, Patient, HMO, Invoice, Payment, Staff, Clinic])],
  providers: [DebtorsService],
  controllers: [DebtorsController],
  exports: [DebtorsService],
})
export class DebtorsModule {}