import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicSubscription } from '../entities/clinic-subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SubscriptionInvoice } from '../entities/subscription-invoice.entity';
import { SubscriptionPayment } from '../entities/subscription-payment.entity';
import { SubscriptionEvent } from '../entities/subscription-event.entity';
import { UsageCounter } from '../entities/usage-counter.entity';
import { Clinic } from '../entities/clinic.entity';
import { Patient } from '../entities/patient.entity';
import { Staff } from '../entities/staff.entity';
import { Branch } from '../entities/branch.entity';
import { FileUpload } from '../entities/file-upload.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { SubscriptionsController } from './subscriptions.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { SubscriptionWebhookController } from './subscription-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClinicSubscription,
      SubscriptionPlan,
      SubscriptionInvoice,
      SubscriptionPayment,
      SubscriptionEvent,
      UsageCounter,
      Clinic,
      Patient,
      Staff,
      Branch,
      FileUpload,
    ]),
    NotificationsModule,
  ],
  controllers: [
    SubscriptionsController,
    AdminSubscriptionsController,
    SubscriptionWebhookController,
  ],
  providers: [SubscriptionsService, SubscriptionSchedulerService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
