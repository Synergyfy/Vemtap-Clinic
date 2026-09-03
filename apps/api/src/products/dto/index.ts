import { IsString, IsOptional, IsNumber, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Eye Drops' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Moisturizing eye drops' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Consumables' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  quantityInStock?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantityInStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
}

export class ProductQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() lowStock?: boolean;
}
