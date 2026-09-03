import { IsString, IsOptional, IsEmail, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientLoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class PatientRegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsString()
  gender: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;
}

export class PatientPortalAuthDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    clinicId: string;
  };
}

export class BookAppointmentDto {
  @ApiProperty({ example: '2026-01-15' })
  @IsString()
  appointmentDate: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  appointmentTime?: string;

  @ApiProperty({ enum: ['consultation', 'follow_up', 'eye_test'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Annual eye checkup' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;
}

export class UpdatePatientProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyContact?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyPhone?: string;
}
