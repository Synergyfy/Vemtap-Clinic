import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SupportTicketType {
  SUPPORT = 'support',
  COMPLAINT = 'complaint',
  INCIDENT = 'incident',
  FEATURE_REQUEST = 'feature_request',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export class CreateSupportTicketDto {
  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @Length(3, 200)
  subject: string;

  @ApiProperty({ minLength: 5 })
  @IsString()
  @Length(5, 5000)
  description: string;

  @ApiPropertyOptional({ enum: SupportTicketType, default: SupportTicketType.SUPPORT })
  @IsOptional()
  @IsEnum(SupportTicketType)
  type?: SupportTicketType;

  @ApiPropertyOptional({ enum: SupportTicketPriority, default: SupportTicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @ApiProperty()
  @IsString()
  clinicId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reporterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reporterName?: string;
}

export class SupportTicketQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
