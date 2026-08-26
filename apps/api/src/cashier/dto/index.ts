import { IsString, IsOptional, IsNumber, IsUUID, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OpenShiftDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  openingBalance: number;

  @ApiProperty({ example: 'staff-uuid' })
  @IsUUID()
  staffId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CloseShiftDto {
  @ApiProperty({ example: 150000 })
  @IsNumber()
  closingBalance: number;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ShiftQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() staffId?: string;
  @ApiPropertyOptional({ enum: ['open', 'closed'] }) @IsOptional() @IsString() status?: string;
}

export class CashierPaymentEntryDto {
  @ApiProperty({ enum: ['cash', 'card', 'transfer', 'hmo', 'split'] })
  @IsString()
  method: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}

export class CashierCartItemDto {
  @ApiProperty() @IsUUID() productId: string;

  @ApiProperty({ example: 'General Consultation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 'Consultation' })
  @IsString()
  category: string;
}

export class CompleteTransactionDto {
  @ApiProperty({ type: [CashierCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashierCartItemDto)
  items: CashierCartItemDto[];

  @ApiProperty({ type: [CashierPaymentEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashierPaymentEntryDto)
  payments: CashierPaymentEntryDto[];

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'General Consultation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Consultation' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 'General consultation for eye checkup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}
