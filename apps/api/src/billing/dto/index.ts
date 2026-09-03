import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../../entities/invoice.entity';
import { PaymentMethod } from '../../entities/payment.entity';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2026-001' })
  @IsString()
  @MaxLength(50)
  invoiceNumber: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: '[{"item":"Consultation","amount":10000},{"item":"Eye Test","amount":15000}]' })
  @IsString()
  items: string;

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() staffId?: string;
  @ApiProperty() @IsUUID() branchId: string;
  @ApiProperty() @IsUUID() clinicId: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ enum: InvoiceStatus }) @IsOptional() @IsEnum(InvoiceStatus) status?: InvoiceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 25000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'TXN-12345' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ example: 'invoice-uuid' })
  @IsUUID()
  invoiceId: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() receivedById?: string;
  @ApiProperty() @IsUUID() clinicId: string;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional({ enum: InvoiceStatus }) @IsOptional() @IsEnum(InvoiceStatus) status?: InvoiceStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
