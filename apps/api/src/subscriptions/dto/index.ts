import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BillingCycle, SubscriptionStatus } from '../../entities/clinic-subscription.entity';
import { PlanLimits } from '../../entities/subscription-plan.entity';
import { SubscriptionInvoiceStatus } from '../../entities/subscription-invoice.entity';

export class UpgradeSubscriptionDto {
  @ApiProperty({ example: 'growth' })
  @IsString()
  @MaxLength(50)
  planCode: string;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}

export class DowngradeSubscriptionDto {
  @ApiProperty({ example: 'starter' })
  @IsString()
  @MaxLength(50)
  planCode: string;

  @ApiPropertyOptional({ enum: BillingCycle })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ example: 'Switching providers' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: 'Cancel now instead of at period end', default: false })
  @IsOptional()
  @IsBoolean()
  immediate?: boolean;
}

export class VerifySubscriptionPaymentDto {
  @ApiProperty({ example: 'sub_inv_01H...' })
  @IsString()
  @MaxLength(120)
  reference: string;
}

export class ListSubscriptionInvoicesQueryDto {
  @ApiPropertyOptional({ enum: SubscriptionInvoiceStatus })
  @IsOptional()
  @IsEnum(SubscriptionInvoiceStatus)
  status?: SubscriptionInvoiceStatus;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'growth' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Growth' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  yearlyPrice: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    example: {
      maxBranches: 3,
      maxStaff: 25,
      maxPatients: 20000,
      ocrPerMonth: 1000,
      whatsappPerMonth: 2000,
      storageMb: 20480,
      optical: true,
      reporting: 'advanced',
      apiIntegrations: false,
    },
  })
  @IsObject()
  limits: PlanLimits;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubscriptionPlanDto extends PartialType(CreateSubscriptionPlanDto) {}

export class AdminOverrideSubscriptionDto {
  @ApiPropertyOptional({ example: 'growth' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  planCode?: string;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  @Min(0)
  extendGraceDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AdminListSubscriptionsQueryDto {
  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ example: 'growth' })
  @IsOptional()
  @IsString()
  planCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class RecordManualSubscriptionPaymentDto {
  @ApiProperty({ example: 'bank-transfer-12345' })
  @IsString()
  @MaxLength(120)
  reference: string;

  @ApiPropertyOptional({ example: 'transfer' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recordedById?: string;
}
