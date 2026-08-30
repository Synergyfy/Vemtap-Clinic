import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetSettingDto {
  @ApiProperty({ example: 'clinic_name' })
  @IsString()
  @MaxLength(100)
  key: string;

  @ApiProperty({ example: 'Vemtap Health Clinic' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

export class BulkSetSettingsDto {
  @ApiProperty({ type: [SetSettingDto] })
  settings: SetSettingDto[];
}

export class SettingQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
}
