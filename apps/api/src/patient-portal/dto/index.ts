import { IsString, IsOptional, IsEmail, IsUUID, MinLength, MaxLength, IsNumber, IsEnum, IsIn } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'clinic-uuid' })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @ApiPropertyOptional({ example: 'branch-uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'VEM-CLINIC123' })
  @IsOptional()
  @IsString()
  clinicQrCode?: string;

  @ApiPropertyOptional({ example: 'guardian', enum: ['individual', 'guardian'] })
  @IsOptional()
  @IsIn(['individual', 'guardian'])
  accountType?: 'individual' | 'guardian';
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

export class SendPhoneOtpDto {
  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;
}

export class VerifyPhoneOtpDto {
  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  code: string;
}

export class SendEmailOtpDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  code: string;
}

export class CreateFamilyMemberInviteDto {
  @ApiProperty({ example: 'Sam Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'dependent@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'child', enum: ['child', 'spouse', 'parent', 'other'] })
  @IsString()
  @IsIn(['child', 'spouse', 'parent', 'other'])
  relationship: 'child' | 'spouse' | 'parent' | 'other';
}

export class ActivateFamilyMemberDto {
  @ApiProperty({ example: 'invite-token' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'Sam Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '2015-04-12' })
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender: string;

  @ApiProperty({ example: '+2348000000001' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  password: string;
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

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-01-15' })
  @IsString()
  appointmentDate: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  appointmentTime?: string;
}

export class MakePaymentDto {
  @ApiProperty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['cash', 'card', 'transfer', 'hmo'] })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}
