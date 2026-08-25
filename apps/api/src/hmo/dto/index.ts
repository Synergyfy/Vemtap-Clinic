import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HMOClaimStatus } from '../../entities/hmo-claim.entity';
import { HMOAppealStatus } from '../../entities/hmo-appeal.entity';
import { RemittanceStatus } from '../../entities/hmo-remittance.entity';

export class CreateHMODto {
  @ApiProperty({ example: 'Hygeia HMO' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() commissionRate?: number;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateHMODto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
}

export class CreateClaimDto {
  @ApiProperty({ example: 'CLM-001' })
  @IsString()
  claimNumber: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amountClaimed: number;

  @ApiPropertyOptional() @IsOptional() @IsString() diagnosis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() treatmentDetails?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documents?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateClaimDto {
  @ApiPropertyOptional({ enum: HMOClaimStatus }) @IsOptional() @IsEnum(HMOClaimStatus) status?: HMOClaimStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() amountApproved?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateAppealDto {
  @ApiProperty({ example: 'APL-001' })
  @IsString()
  appealNumber: string;

  @ApiProperty({ example: 'Wrong amount deducted from claim' })
  @IsString()
  reason: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() disputedAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() supportingDocuments?: string;

  @ApiProperty({ example: 'claim-uuid' })
  @IsUUID()
  claimId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateAppealDto {
  @ApiPropertyOptional({ enum: HMOAppealStatus }) @IsOptional() @IsEnum(HMOAppealStatus) status?: HMOAppealStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() resolutionNotes?: string;
}

export class CreateRemittanceDto {
  @ApiProperty({ example: 'REM-001' })
  @IsString()
  remittanceNumber: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  commissionDeducted: number;

  @ApiProperty({ example: 180000 })
  @IsNumber()
  netAmount: number;

  @ApiPropertyOptional() @IsOptional() @IsString() claimsBreakdown?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() periodStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() periodEnd?: string;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateRemittanceDto {
  @ApiPropertyOptional({ enum: RemittanceStatus }) @IsOptional() @IsEnum(RemittanceStatus) status?: RemittanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class HMOQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
