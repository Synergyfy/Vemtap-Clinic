import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileCategory } from '../../entities/file-upload.entity';

export class CreateFileUploadDto {
  @ApiProperty({ example: 'receipt.pdf' })
  @IsString()
  @MaxLength(255)
  originalName: string;

  @ApiProperty({ example: 'uuid-filename.pdf' })
  @IsString()
  @MaxLength(255)
  storedName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional({ enum: FileCategory, default: FileCategory.GENERAL })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) url?: string;

  @ApiPropertyOptional() @IsOptional() metadata?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() relatedEntityId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) relatedEntityType?: string;

  @ApiProperty({ example: 'clinic-uuid' })
  @IsUUID()
  clinicId: string;
}

export class UpdateFileUploadDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) url?: string;
  @ApiPropertyOptional() @IsOptional() metadata?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsEnum(FileCategory) category?: FileCategory;
}

export class FileUploadQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() patientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(FileCategory) category?: FileCategory;
  @ApiPropertyOptional() @IsOptional() @IsUUID() uploadedById?: string;
}