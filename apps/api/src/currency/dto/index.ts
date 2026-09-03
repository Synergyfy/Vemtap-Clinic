import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyCode } from '../../entities/currency-config.entity';

export class CreateCurrencyConfigDto {
  @ApiProperty({ enum: CurrencyCode })
  @IsEnum(CurrencyCode)
  code: CurrencyCode;

  @ApiProperty({ example: '₦' })
  @IsString()
  @MaxLength(10)
  symbol: string;

  @ApiProperty({ example: 'Nigerian Naira' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'en-NG' })
  @IsString()
  @MaxLength(20)
  locale: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  exchangeRateToBase?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBase?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateCurrencyConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10) symbol?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) locale?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() exchangeRateToBase?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBase?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CurrencyConfigQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(CurrencyCode) code?: CurrencyCode;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBase?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}