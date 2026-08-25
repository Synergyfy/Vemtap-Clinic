import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LensOrderStatus } from '../../entities/lens-order.entity';

export class CreateOpticalItemDto {
  @ApiProperty({ example: 'Ray-Ban Aviator' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Ray-Ban' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'Frames' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 'Prescription' })
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ example: 'Medium' })
  @IsOptional()
  @IsString()
  frameSize?: string;

  @ApiPropertyOptional({ example: 'Progressive' })
  @IsOptional()
  @IsString()
  lensType?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  quantityInStock?: number;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateOpticalItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantityInStock?: number;
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
}

export class CreateLensOrderDto {
  @ApiProperty({ example: 'Progressive Lens' })
  @IsString()
  @MaxLength(200)
  lensType: string;

  @ApiPropertyOptional({ example: 'Ray-Ban Frame' })
  @IsOptional()
  @IsString()
  frameDescription?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() rightEyeSphere?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() leftEyeSphere?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rightEyeCylinder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() leftEyeCylinder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rightEyeAxis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() leftEyeAxis?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  totalPrice: number;

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateLensOrderDto {
  @ApiPropertyOptional({ enum: LensOrderStatus }) @IsOptional() @IsEnum(LensOrderStatus) status?: LensOrderStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() actualDeliveryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
