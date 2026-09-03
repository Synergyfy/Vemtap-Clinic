import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '../../entities/staff.entity';

export class CreateStaffDto {
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

  @ApiProperty({ example: 'john.doe@vemtap.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ enum: StaffRole })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiPropertyOptional({ example: 'Ophthalmology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'Retina Specialist' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({ example: 'MED-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  branchId: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class StaffQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class StaffResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() role: string;
  @ApiProperty() department: string;
  @ApiProperty() specialization: string;
  @ApiProperty() licenseNumber: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() clinicId: string;
  @ApiProperty() branchId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
