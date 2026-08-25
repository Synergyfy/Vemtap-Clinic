import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, IsBoolean, IsArray, MaxLength } from 'class-validator';
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

// --- HMO Plans ---

export class CreateHMOPlanDto {
  @ApiProperty({ example: 'Basic Plan' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryCopay?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryCoverage?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() annualLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() monthlyLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalAllowance?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugAllowance?: number;

  @ApiPropertyOptional() @IsOptional() @IsArray() excludedServices?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresAuthorization?: boolean;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;
}

export class UpdateHMOPlanDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryCopay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryCoverage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() annualLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() monthlyLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalAllowance?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugAllowance?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() excludedServices?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresAuthorization?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

// --- HMO Agreements ---

export class CreateHMOAgreementDto {
  @ApiProperty({ example: 'AGR-2026-001' })
  @IsString()
  @MaxLength(50)
  agreementNumber: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'bi-annually', 'annually'] })
  @IsOptional()
  @IsEnum(['monthly', 'quarterly', 'bi-annually', 'annually'])
  paymentCycle?: string;

  @ApiPropertyOptional({ enum: ['monthly', 'bi-weekly', 'weekly'] })
  @IsOptional()
  @IsEnum(['monthly', 'bi-weekly', 'weekly'])
  claimsSubmissionSchedule?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalFramePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lensPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugMarkup?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryPrice?: number;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateHMOAgreementDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentCycle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() claimsSubmissionSchedule?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() consultationPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() eyeTestPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() opticalFramePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lensPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() drugMarkup?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() surgeryPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

// --- Coverage Check ---

export class CoverageCheckDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiProperty({ enum: ['consultation', 'eye_test', 'optical', 'drug', 'surgery'] })
  @IsEnum(['consultation', 'eye_test', 'optical', 'drug', 'surgery'])
  serviceType: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  serviceAmount: number;
}

export class CoverageCheckResponseDto {
  @ApiProperty() covered: boolean;
  @ApiProperty() coveragePercent: number;
  @ApiProperty() copayAmount: number;
  @ApiProperty() hmoPays: number;
  @ApiProperty() patientPays: number;
  @ApiProperty() requiresAuthorization: boolean;
  @ApiProperty() remainingAllowance: number;
  @ApiProperty() planName: string;
}

// --- Authorization ---

export class CreateAuthorizationDto {
  @ApiProperty({ example: 'AUTH-2026-001' })
  @IsString()
  @MaxLength(50)
  authorizationNumber: string;

  @ApiProperty({ enum: ['consultation', 'eye_test', 'optical', 'drug', 'surgery', 'procedure'] })
  @IsEnum(['consultation', 'eye_test', 'optical', 'drug', 'surgery', 'procedure'])
  serviceType: string;

  @ApiPropertyOptional() @IsOptional() @IsString() clinicalJustification?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  estimatedCost: number;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() planId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() requestedById?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateAuthorizationDto {
  @ApiPropertyOptional({ enum: ['pending', 'submitted', 'approved', 'rejected', 'expired', 'escalated', 'cancelled'] })
  @IsOptional()
  @IsEnum(['pending', 'submitted', 'approved', 'rejected', 'expired', 'escalated', 'cancelled'])
  status?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() approvedAmount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hmoReferenceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hmoNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectionReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() approvedById?: string;
}

// --- Claims Batching ---

export class CreateClaimBatchDto {
  @ApiProperty({ example: 'BATCH-2026-001' })
  @IsString()
  @MaxLength(50)
  batchNumber: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() periodStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() periodEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ example: 'hmo-uuid' })
  @IsUUID()
  hmoId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateClaimBatchDto {
  @ApiPropertyOptional({ enum: ['draft', 'submitted', 'processing', 'completed', 'rejected'] })
  @IsOptional()
  @IsEnum(['draft', 'submitted', 'processing', 'completed', 'rejected'])
  status?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() approvedAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AddClaimsToBatchDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  claimIds: string[];
}

// --- Claim Documents ---

export class UploadClaimDocumentDto {
  @ApiProperty({ example: 'receipt.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: '/uploads/receipt.pdf' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  fileType: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() fileSize?: number;
  @ApiPropertyOptional({ example: 'receipt' }) @IsOptional() @IsString() documentType?: string;

  @ApiProperty({ example: 'claim-uuid' })
  @IsUUID()
  claimId: string;
}
