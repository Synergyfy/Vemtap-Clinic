import { IsString, IsOptional, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'Amoxicillin 500mg' })
  @IsString()
  medication: string;

  @ApiProperty({ example: '1 capsule' })
  @IsString()
  @MaxLength(100)
  dosage: string;

  @ApiProperty({ example: '3 times daily' })
  @IsString()
  @MaxLength(100)
  frequency: string;

  @ApiPropertyOptional({ example: '7 days' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @ApiPropertyOptional({ example: 'Take with food' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ example: 'medical-record-uuid' })
  @IsUUID()
  medicalRecordId: string;

  @ApiPropertyOptional({ example: 'staff-uuid' })
  @IsOptional()
  @IsUUID()
  prescribedById?: string;
}

export class UpdatePrescriptionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() medication?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dosage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() frequency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
