import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDemoRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clinicType = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  clinicName = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  branchCount = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  preferredDate = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  preferredTime = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName = '';

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone = '';
}
