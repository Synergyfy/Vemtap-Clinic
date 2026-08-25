import { IsString, IsOptional, IsNumber, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
