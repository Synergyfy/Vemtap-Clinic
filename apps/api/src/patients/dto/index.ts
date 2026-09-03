import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
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

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: 'Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ enum: ['private', 'hmo'], default: 'private' })
  @IsOptional()
  @IsEnum(['private', 'hmo'])
  patientType?: 'private' | 'hmo';

  @ApiPropertyOptional({ example: 'hmo-123' })
  @IsOptional()
  @IsString()
  hmoId?: string;

  @ApiPropertyOptional({ example: 'Hygeia HMO' })
  @IsOptional()
  @IsString()
  hmoName?: string;

  @ApiPropertyOptional({ example: 'HMO123456' })
  @IsOptional()
  @IsString()
  hmoNumber?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '+1234567891' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'AA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  genotype?: string;

  @ApiPropertyOptional({ example: 'Penicillin' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  allergies?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;
}

export class UpdatePatientDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
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

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: 'Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ enum: ['private', 'hmo'] })
  @IsOptional()
  @IsEnum(['private', 'hmo'])
  patientType?: 'private' | 'hmo';

  @ApiPropertyOptional({ example: 'hmo-123' })
  @IsOptional()
  @IsString()
  hmoId?: string;

  @ApiPropertyOptional({ example: 'Hygeia HMO' })
  @IsOptional()
  @IsString()
  hmoName?: string;

  @ApiPropertyOptional({ example: 'HMO123456' })
  @IsOptional()
  @IsString()
  hmoNumber?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContact?: string;

  @ApiPropertyOptional({ example: '+1234567891' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'AA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  genotype?: string;

  @ApiPropertyOptional({ example: 'Penicillin' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  allergies?: string;

  @ApiPropertyOptional({ enum: ['new', 'active', 'inactive'] })
  @IsOptional()
  @IsEnum(['new', 'active', 'inactive'])
  status?: 'new' | 'active' | 'inactive';

  @ApiPropertyOptional({ example: 'branch-uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class PatientQueryDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['private', 'hmo'] })
  @IsOptional()
  @IsEnum(['private', 'hmo'])
  patientType?: 'private' | 'hmo';

  @ApiPropertyOptional({ enum: ['new', 'active', 'inactive'] })
  @IsOptional()
  @IsEnum(['new', 'active', 'inactive'])
  status?: 'new' | 'active' | 'inactive';

  @ApiPropertyOptional({ example: 'branch-uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'clinic-uuid' })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PatientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  occupation?: string;

  @ApiProperty()
  patientType: string;

  @ApiPropertyOptional()
  hmoId?: string;

  @ApiPropertyOptional()
  hmoName?: string;

  @ApiPropertyOptional()
  hmoNumber?: string;

  @ApiPropertyOptional()
  emergencyContact?: string;

  @ApiPropertyOptional()
  emergencyPhone?: string;

  @ApiPropertyOptional()
  bloodGroup?: string;

  @ApiPropertyOptional()
  genotype?: string;

  @ApiPropertyOptional()
  allergies?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  clinicId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedPatientResponseDto {
  @ApiProperty({ type: [PatientResponseDto] })
  data: PatientResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}