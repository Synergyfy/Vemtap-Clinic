import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './app.config';
import { getDatabaseConfig } from './database.config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { StaffModule } from './staff/staff.module';
import { BranchesModule } from './branches/branches.module';
import { QueueModule } from './queue/queue.module';
import { RecordsModule } from './records/records.module';
import { DrugsModule } from './drugs/drugs.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { OpticalModule } from './optical/optical.module';
import { ProductsModule } from './products/products.module';
import { BillingModule } from './billing/billing.module';
import { HmoModule } from './hmo/hmo.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PatientPortalModule } from './patient-portal/patient-portal.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CashierModule } from './cashier/cashier.module';
import { PatientDocumentsModule } from './patient-documents/patient-documents.module';
import { StaffTasksModule } from './staff-tasks/staff-tasks.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SurgeryModule } from './surgery/surgery.module';
import { ClinicalReportingModule } from './clinical-reporting/clinical-reporting.module';

@Module({
  imports: [
    appConfig,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    HealthModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    StaffModule,
    BranchesModule,
    QueueModule,
    RecordsModule,
    DrugsModule,
    PrescriptionsModule,
    SuppliersModule,
    OpticalModule,
    ProductsModule,
    BillingModule,
    HmoModule,
    DashboardModule,
    PatientPortalModule,
    NotificationsModule,
    CashierModule,
    PatientDocumentsModule,
    StaffTasksModule,
    FeedbackModule,
    AuditLogsModule,
    SurgeryModule,
    ClinicalReportingModule,
  ],
})
export class AppModule {}
