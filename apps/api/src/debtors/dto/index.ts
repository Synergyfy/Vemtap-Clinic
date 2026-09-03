import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsDateString, Min, ValidateNested, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DebtorType, DebtorStatus } from '../../entities/debtor.entity';
import { PaymentPlanStatus } from '../../entities/payment-plan.entity';
import { InstallmentStatus } from '../../entities/payment-plan-installment.entity';
import { CollectionActivityType, CollectionOutcome } from '../../entities/collection-activity.entity';

export class CreateDebtorDto {
  @ApiProperty({ enum: DebtorType }) @IsEnum(DebtorType) type: DebtorType;

  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() hmoId?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) totalOutstanding?: number;

  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedCollectorId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() nextFollowUpDate?: string;
}

export class UpdateDebtorDto {
  @ApiPropertyOptional({ enum: DebtorStatus }) @IsOptional() @IsEnum(DebtorStatus) status?: DebtorStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedCollectorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextFollowUpDate?: string;
}

export class DebtorQueryDto {
  @ApiPropertyOptional({ enum: DebtorType }) @IsOptional() @IsEnum(DebtorType) type?: DebtorType;
  @ApiPropertyOptional({ enum: DebtorStatus }) @IsOptional() @IsEnum(DebtorStatus) status?: DebtorStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() hmoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedCollectorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class AgingReportDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() asOfDate?: string;
}

export class CreatePaymentPlanDto {
  @ApiProperty() @IsUUID() debtorId: string;

  @ApiProperty() @IsNumber() @Min(0.01) totalAmount: number;

  @ApiProperty() @IsInt() @Min(1) totalInstallments: number;

  @ApiProperty({ example: '2026-09-01' }) @IsDateString() startDate: string;

  @ApiProperty({ example: '2027-02-01' }) @IsDateString() endDate: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() approvedById?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdatePaymentPlanDto {
  @ApiPropertyOptional({ enum: PaymentPlanStatus }) @IsOptional() @IsEnum(PaymentPlanStatus) status?: PaymentPlanStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class PaymentPlanQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() debtorId?: string;
  @ApiPropertyOptional({ enum: PaymentPlanStatus }) @IsOptional() @IsEnum(PaymentPlanStatus) status?: PaymentPlanStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class CreateInstallmentDto {
  @ApiProperty() @IsInt() @Min(1) installmentNumber: number;

  @ApiProperty() @IsNumber() @Min(0.01) amountDue: number;

  @ApiProperty({ example: '2026-09-15' }) @IsDateString() dueDate: string;
}

export class UpdateInstallmentDto {
  @ApiPropertyOptional({ enum: InstallmentStatus }) @IsOptional() @IsEnum(InstallmentStatus) status?: InstallmentStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amountPaid?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() paidDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateCollectionActivityDto {
  @ApiProperty() @IsUUID() debtorId: string;

  @ApiProperty({ enum: CollectionActivityType }) @IsEnum(CollectionActivityType) activityType: CollectionActivityType;

  @ApiPropertyOptional({ enum: CollectionOutcome }) @IsOptional() @IsEnum(CollectionOutcome) outcome?: CollectionOutcome;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amountPromised?: number;

  @ApiPropertyOptional() @IsOptional() @IsDateString() promiseDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() nextActionDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nextActionNotes?: string;
}

export class UpdateCollectionActivityDto {
  @ApiPropertyOptional({ enum: CollectionOutcome }) @IsOptional() @IsEnum(CollectionOutcome) outcome?: CollectionOutcome;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amountPromised?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() promiseDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextActionDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nextActionNotes?: string;
}

export class CollectionActivityQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() debtorId?: string;
  @ApiPropertyOptional({ enum: CollectionActivityType }) @IsOptional() @IsEnum(CollectionActivityType) activityType?: CollectionActivityType;
  @ApiPropertyOptional({ enum: CollectionOutcome }) @IsOptional() @IsEnum(CollectionOutcome) outcome?: CollectionOutcome;
  @ApiPropertyOptional() @IsOptional() @IsUUID() performedById?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}