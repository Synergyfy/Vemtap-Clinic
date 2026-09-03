import { IsString, IsOptional, IsEnum, IsUUID, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueueStatus } from '../../entities/queue-entry.entity';
import { AnnouncementType } from '../../entities/queue-announcement.entity';

export class CreateQueueEntryDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiPropertyOptional({ example: 'reception' })
  @IsOptional()
  @IsString()
  station?: string;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQueueEntryDto {
  @ApiPropertyOptional({ enum: QueueStatus })
  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  station?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueueQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() branchId?: string;
  @ApiPropertyOptional({ enum: QueueStatus }) @IsOptional() @IsEnum(QueueStatus) status?: QueueStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() station?: string;
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Next patient please' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: AnnouncementType, default: AnnouncementType.GENERAL })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetQueueType?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;
}

export class ResetQueueDto {
  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}
