import { IsString, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObservationCategory } from '../../entities/observation-note.entity';

export class CreateObservationNoteDto {
  @ApiProperty({ example: 'Vitals recorded - BP: 120/80, Temp: 37.2°C' })
  @IsString()
  @MaxLength(2000)
  note: string;

  @ApiPropertyOptional({ enum: ObservationCategory, default: 'vitals' })
  @IsOptional()
  @IsEnum(ObservationCategory)
  category?: ObservationCategory;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class ObservationNoteQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clinicId?: string;
}