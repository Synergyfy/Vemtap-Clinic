import { IsString, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VitalsDto {
  @ApiPropertyOptional() @IsOptional() temperature?: number;
  @ApiPropertyOptional() @IsOptional() bloodPressureSystolic?: number;
  @ApiPropertyOptional() @IsOptional() bloodPressureDiastolic?: number;
  @ApiPropertyOptional() @IsOptional() heartRate?: number;
  @ApiPropertyOptional() @IsOptional() respiratoryRate?: number;
  @ApiPropertyOptional() @IsOptional() weight?: number;
  @ApiPropertyOptional() @IsOptional() height?: number;
  @ApiPropertyOptional() @IsOptional() oxygenSaturation?: number;
  @ApiPropertyOptional() @IsOptional() bloodGroup?: string;
}

export class EyeTestDto {
  @ApiPropertyOptional() @IsOptional() rightEyeSphere?: string;
  @ApiPropertyOptional() @IsOptional() leftEyeSphere?: string;
  @ApiPropertyOptional() @IsOptional() rightEyeCylinder?: string;
  @ApiPropertyOptional() @IsOptional() leftEyeCylinder?: string;
  @ApiPropertyOptional() @IsOptional() rightEyeAxis?: string;
  @ApiPropertyOptional() @IsOptional() leftEyeAxis?: string;
  @ApiPropertyOptional() @IsOptional() rightEyeAdd?: string;
  @ApiPropertyOptional() @IsOptional() leftEyeAdd?: string;
  @ApiPropertyOptional() @IsOptional() rightEyePupil?: string;
  @ApiPropertyOptional() @IsOptional() leftEyePupil?: string;
  @ApiPropertyOptional() @IsOptional() rightEyeIOP?: string;
  @ApiPropertyOptional() @IsOptional() leftEyeIOP?: string;
  @ApiPropertyOptional() @IsOptional() diagnosis?: string;
  @ApiPropertyOptional() @IsOptional() notes?: string;
}

export class CreateMedicalRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsString() chiefComplaint?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() historyOfPresentIllness?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pastMedicalHistory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() diagnosis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() treatmentPlan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty() @IsUUID() patientId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() staffId?: string;
  @ApiProperty() @IsUUID() branchId: string;
  @ApiProperty() @IsUUID() clinicId: string;

  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => VitalsDto) vitals?: VitalsDto;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => EyeTestDto) eyeTest?: EyeTestDto;
}

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}

export class MedicalRecordQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() staffId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() branchId?: string;
}
