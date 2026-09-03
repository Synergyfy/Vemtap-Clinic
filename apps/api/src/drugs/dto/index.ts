import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDrugDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Amoxicillin Trihydrate' })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiProperty({ example: 'Antibiotics' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 'Capsule' })
  @IsString()
  @MaxLength(50)
  dosageForm: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @MaxLength(50)
  strength: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  quantityInStock?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateDrugDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genericName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dosageForm?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() strength?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantityInStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class DispenseDrugDto {
  @ApiProperty({ example: 'drug-uuid' })
  @IsUUID()
  drugId: string;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  quantityDispensed: number;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dispensedById?: string;
}

export class DrugQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() lowStock?: boolean;
}

export class AdjustStockDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  quantity: number;
}
