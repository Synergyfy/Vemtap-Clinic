import { IsString, IsOptional, IsEnum, IsUUID, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, TicketPriority, TicketType } from '../../entities/support-ticket.entity';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Unable to login to the system' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'Getting 404 error when trying to access the patient portal' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: TicketType, default: TicketType.SUPPORT })
  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ example: 'staff-uuid' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateSupportTicketDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketType) type?: TicketType;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isResolved?: boolean;
}

export class CreateTicketMessageDto {
  @ApiProperty({ example: 'Thank you for reporting this issue. We are investigating.' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'ticket-uuid' })
  @IsUUID()
  ticketId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class SupportTicketQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TicketType) type?: TicketType;
  @ApiPropertyOptional() @IsOptional() @IsUUID() reporterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

export class AssignTicketDto {
  @ApiProperty({ example: 'staff-uuid' })
  @IsUUID()
  assigneeId: string;
}

export class ResolveTicketDto {
  @ApiPropertyOptional() @IsOptional() @IsString() resolutionNotes?: string;
}