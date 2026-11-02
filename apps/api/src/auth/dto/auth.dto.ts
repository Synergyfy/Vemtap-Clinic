import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
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
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: AuthUserDto;
}