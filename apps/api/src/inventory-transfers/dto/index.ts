import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsNumber, ValidateNested, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransferType, TransferStatus } from '../../entities/transfer-request.entity';
import { ItemType } from '../../entities/transfer-item.entity';

export class TransferItemDto {
  @ApiProperty({ enum: ItemType }) @IsEnum(ItemType) itemType: ItemType;

  @ApiPropertyOptional() @IsOptional() @IsUUID() productId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() drugId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() opticalItemId?: string;

  @ApiProperty() @IsInt() @Min(1) quantityRequested: number;

  @ApiPropertyOptional() @IsOptional() @IsString() batchNumber?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() serialNumber?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() expiryDate?: string;
}

export class CreateTransferRequestDto {
  @ApiProperty({ enum: TransferType }) @IsEnum(TransferType) type: TransferType;

  @ApiProperty() @IsUUID() fromBranchId: string;

  @ApiProperty() @IsUUID() toBranchId: string;

  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ type: [TransferItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => TransferItemDto) items: TransferItemDto[];
}

export class UpdateTransferRequestDto {
  @ApiPropertyOptional({ enum: TransferType }) @IsOptional() @IsEnum(TransferType) type?: TransferType;
  @ApiPropertyOptional() @IsOptional() @IsUUID() fromBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() toBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [TransferItemDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TransferItemDto) items?: TransferItemDto[];
}

export class TransferRequestQueryDto {
  @ApiPropertyOptional({ enum: TransferType }) @IsOptional() @IsEnum(TransferType) type?: TransferType;
  @ApiPropertyOptional({ enum: TransferStatus }) @IsOptional() @IsEnum(TransferStatus) status?: TransferStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() fromBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() toBranchId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class ApproveTransferDto {
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ShipItemDto {
  @ApiProperty() @IsUUID() itemId: string;

  @ApiProperty() @IsInt() @Min(1) quantityShipped: number;
}

export class ShipTransferDto {
  @ApiProperty({ type: [ShipItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => ShipItemDto) items: ShipItemDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ReceiveItemDto {
  @ApiProperty() @IsUUID() itemId: string;

  @ApiProperty() @IsInt() @Min(0) quantityReceived: number;
}

export class ReceiveTransferDto {
  @ApiProperty({ type: [ReceiveItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReceiveItemDto) items: ReceiveItemDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CancelTransferDto {
  @ApiProperty() @IsString() reason: string;
}