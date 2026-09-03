import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsUUID, IsBoolean, ValidateNested, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProcedureCategory } from '../../entities/surgical-procedure.entity';
import { RoomStatus } from '../../entities/operating-room.entity';
import { SurgeryStatus } from '../../entities/surgery-schedule.entity';

export class CreateProcedureDto {
  @ApiProperty({ example: 'Phacoemulsification' })
  @IsString() @Min(1) name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiProperty({ enum: ProcedureCategory, example: ProcedureCategory.CATARACT })
  @IsEnum(ProcedureCategory) category: ProcedureCategory;

  @ApiProperty({ example: 30 })
  @IsNumber() @Min(1) estimatedDurationMinutes: number;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) requiredStaff?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) requiredEquipment?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) preOpRequirements?: string[];

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) postOpInstructions?: string[];

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProcedureDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Min(1) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ProcedureCategory }) @IsOptional() @IsEnum(ProcedureCategory) category?: ProcedureCategory;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) estimatedDurationMinutes?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) requiredStaff?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) requiredEquipment?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) preOpRequirements?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) postOpInstructions?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ProcedureQueryDto {
  @ApiPropertyOptional({ enum: ProcedureCategory }) @IsOptional() @IsEnum(ProcedureCategory) category?: ProcedureCategory;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class CreateOperatingRoomDto {
  @ApiProperty({ example: 'OR-1' })
  @IsString() @Min(1) name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
  @IsOptional() @IsEnum(RoomStatus) status?: RoomStatus;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) equipment?: string[];

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) capacity?: number;

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateOperatingRoomDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Min(1) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: RoomStatus }) @IsOptional() @IsEnum(RoomStatus) status?: RoomStatus;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) equipment?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) capacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class OperatingRoomQueryDto {
  @ApiPropertyOptional({ enum: RoomStatus }) @IsOptional() @IsEnum(RoomStatus) status?: RoomStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class CreateSurgeryScheduleDto {
  @ApiProperty() @IsUUID() procedureId: string;
  @ApiProperty() @IsUUID() operatingRoomId: string;
  @ApiProperty() @IsUUID() patientId: string;
  @ApiProperty() @IsUUID() primarySurgeonId: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) assistantSurgeonIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) anesthesiologistIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) nurseIds?: string[];
  @ApiProperty({ example: '2026-09-01T08:00:00Z' })
  @IsDateString() scheduledStartTime: string;
  @ApiPropertyOptional({ example: '2026-09-01T09:30:00Z' })
  @IsOptional() @IsDateString() scheduledEndTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preoperativeNotes?: string;
}

export class UpdateSurgeryScheduleDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() operatingRoomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() primarySurgeonId?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) assistantSurgeonIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) anesthesiologistIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID(undefined, { each: true }) nurseIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledStartTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledEndTime?: string;
  @ApiPropertyOptional({ enum: SurgeryStatus }) @IsOptional() @IsEnum(SurgeryStatus) status?: SurgeryStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() cancellationReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preoperativeNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() intraoperativeNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postoperativeNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complications?: string;
}

export class SurgeryScheduleQueryDto {
  @ApiPropertyOptional({ enum: SurgeryStatus }) @IsOptional() @IsEnum(SurgeryStatus) status?: SurgeryStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() surgeonId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() operatingRoomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class AvailableSlotsDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsUUID() operatingRoomId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(15) durationMinutes?: number;
}