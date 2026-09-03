import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsNumber, ValidateNested, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReturnType, ReturnReason, ReturnStatus } from '../../entities/return-request.entity';
import { RefundStatus, RefundMethod } from '../../entities/refund.entity';

export class ReturnItemDto {
  @ApiProperty({ enum: ['product', 'drug', 'optical'] })
  @IsString() itemType: 'product' | 'drug' | 'optical';

  @ApiProperty() @IsUUID() itemId: string;

  @ApiProperty() @IsString() itemName: string;

  @ApiProperty() @IsNumber() @Min(1) quantity: number;

  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;

  @ApiProperty() @IsNumber() @Min(0) totalPrice: number;

  @ApiPropertyOptional() @IsOptional() @IsString() batchNumber?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() serialNumber?: string;
}

export class CreateReturnRequestDto {
  @ApiProperty({ enum: ReturnType }) @IsEnum(ReturnType) type: ReturnType;

  @ApiPropertyOptional() @IsOptional() @IsUUID() invoiceId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;

  @ApiProperty({ enum: ReturnReason }) @IsEnum(ReturnReason) reason: ReturnReason;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiProperty({ type: [ReturnItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => ReturnItemDto) items: ReturnItemDto[];
}

export class UpdateReturnRequestDto {
  @ApiPropertyOptional({ enum: ReturnReason }) @IsOptional() @IsEnum(ReturnReason) reason?: ReturnReason;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [ReturnItemDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ReturnItemDto) items?: ReturnItemDto[];
}

export class ReviewReturnDto {
  @ApiProperty({ enum: [ReturnStatus.UNDER_REVIEW, ReturnStatus.APPROVED, ReturnStatus.REJECTED] })
  @IsEnum(ReturnStatus) status: ReturnStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ReceiveReturnDto {
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ReturnRequestQueryDto {
  @ApiPropertyOptional({ enum: ReturnType }) @IsOptional() @IsEnum(ReturnType) type?: ReturnType;
  @ApiPropertyOptional({ enum: ReturnStatus }) @IsOptional() @IsEnum(ReturnStatus) status?: ReturnStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() invoiceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class CreateRefundDto {
  @ApiProperty() @IsUUID() returnRequestId: string;

  @ApiProperty() @IsNumber() @Min(0.01) amount: number;

  @ApiPropertyOptional({ enum: RefundMethod, default: RefundMethod.ORIGINAL_PAYMENT })
  @IsOptional() @IsEnum(RefundMethod) method?: RefundMethod;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ProcessRefundDto {
  @ApiProperty({ enum: [RefundStatus.PROCESSING, RefundStatus.COMPLETED, RefundStatus.FAILED, RefundStatus.CANCELLED] })
  @IsEnum(RefundStatus) status: RefundStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() transactionReference?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() failureReason?: string;
}

export class RefundQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() returnRequestId?: string;
  @ApiPropertyOptional({ enum: RefundStatus }) @IsOptional() @IsEnum(RefundStatus) status?: RefundStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}