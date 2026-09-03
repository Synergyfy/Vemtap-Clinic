import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory, ExpenseStatus } from '../../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Electricity bill May 2026' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: '2026-05-20' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional() @IsOptional() @IsString() recordedById?: string;
  @ApiProperty() @IsString() clinicId: string;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ enum: ExpenseCategory }) @IsOptional() @IsEnum(ExpenseCategory) category?: ExpenseCategory;
  @ApiPropertyOptional() @IsOptional() @IsNumber() amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional({ enum: ExpenseStatus }) @IsOptional() @IsEnum(ExpenseStatus) status?: ExpenseStatus;
}

export class ExpenseQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() clinicId?: string;
  @ApiPropertyOptional({ enum: ExpenseCategory }) @IsOptional() @IsEnum(ExpenseCategory) category?: ExpenseCategory;
  @ApiPropertyOptional({ enum: ExpenseStatus }) @IsOptional() @IsEnum(ExpenseStatus) status?: ExpenseStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
