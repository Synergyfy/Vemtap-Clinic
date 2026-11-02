import { IsString, IsOptional, IsBoolean, IsUUID, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({ example: 'ClearVision Eye Clinic' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: '123 Medical Drive' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos State' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '+234 812 345 6789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@clearvision.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: 'www.clearvision.com' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ example: 'Growth' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;
}

export class UpdateClinicDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(100) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) plan?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() plan?: string;
}