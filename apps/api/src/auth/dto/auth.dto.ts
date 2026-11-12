import { IsString, IsEmail, MinLength, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@vemtap.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@vemtap.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Apex Vision Clinic', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicName?: string;

  @ApiProperty({ example: '12 Medical Drive', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @ApiProperty({ example: 'Ikeja', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicCity?: string;

  @ApiProperty({ example: 'Lagos', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicState?: string;

  @ApiProperty({ example: '08012345678', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicPhone?: string;

  @ApiProperty({ example: 'contact@apexvision.ng', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsEmail()
  clinicEmail?: string;

  @ApiProperty({ example: 'clinic-uuid', required: false, nullable: true })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  clinicId?: string | null;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: 'john@vemtap.com', required: false })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ example: '+234 812 345 6789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'john@vemtap.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@vemtap.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'reset-token-from-email' })
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'opaque-refresh-token' })
  refreshToken: string;
}

export class AuthUserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  roles: string[];

  @ApiProperty({ nullable: true })
  clinicId: string | null;

  @ApiProperty({ required: false, nullable: true })
  clinicName?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: AuthUserDto;
}