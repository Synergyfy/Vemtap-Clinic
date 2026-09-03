import { IsString, IsOptional, IsEnum, IsObject, IsUUID, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReportType, ReportFormat } from '../../entities/report-template.entity';
import { ReportStatus, ReportDeliveryMethod } from '../../entities/generated-report.entity';

export class CreateReportTemplateDto {
  @ApiProperty({ example: 'Monthly Revenue Report' })
  @IsString() name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiProperty({ enum: ReportType }) @IsEnum(ReportType) type: ReportType;

  @ApiPropertyOptional() @IsOptional() @IsObject() queryConfig?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsObject() defaultParameters?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsObject() parameterSchema?: Record<string, any>;

  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsOptional() @IsEnum(ReportFormat) defaultFormat?: ReportFormat;

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isScheduled?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() cronExpression?: string;

  @ApiPropertyOptional({ enum: ReportFormat }) @IsOptional() @IsEnum(ReportFormat) scheduledFormat?: ReportFormat;

  @ApiPropertyOptional() @IsOptional() @IsObject() scheduledParameters?: Record<string, any>;
}

export class UpdateReportTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ReportType }) @IsOptional() @IsEnum(ReportType) type?: ReportType;
  @ApiPropertyOptional() @IsOptional() @IsObject() queryConfig?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() defaultParameters?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() parameterSchema?: Record<string, any>;
  @ApiPropertyOptional({ enum: ReportFormat }) @IsOptional() @IsEnum(ReportFormat) defaultFormat?: ReportFormat;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isScheduled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() cronExpression?: string;
  @ApiPropertyOptional({ enum: ReportFormat }) @IsOptional() @IsEnum(ReportFormat) scheduledFormat?: ReportFormat;
  @ApiPropertyOptional() @IsOptional() @IsObject() scheduledParameters?: Record<string, any>;
}

export class ReportTemplateQueryDto {
  @ApiPropertyOptional({ enum: ReportType }) @IsOptional() @IsEnum(ReportType) type?: ReportType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isScheduled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class GenerateReportDto {
  @ApiProperty() @IsUUID() templateId: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() parameters?: Record<string, any>;

  @ApiPropertyOptional({ enum: ReportFormat }) @IsOptional() @IsEnum(ReportFormat) format?: ReportFormat;

  @ApiPropertyOptional({ enum: ReportDeliveryMethod }) @IsOptional() @IsEnum(ReportDeliveryMethod) deliveryMethod?: ReportDeliveryMethod;

  @ApiPropertyOptional() @IsOptional() @IsString() deliveryTarget?: string;
}

export class GeneratedReportQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() templateId?: string;
  @ApiPropertyOptional({ enum: ReportStatus }) @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() generatedById?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}