import { IsString, IsOptional, IsEnum, IsObject, IsUUID, IsNumber, IsArray, ValidateNested, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  HmoIntegrationProvider, IntegrationStatus, AuthType, EndpointType
} from '../../entities/hmo-integration.entity';
import { ApiLogStatus, LogDirection } from '../../entities/hmo-api-log.entity';

export class AuthConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() apiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() username?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() password?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tokenUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() custom?: Record<string, any>;
}

export class EndpointConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() eligibility_check?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() claim_submission?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() claim_status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remittance_advice?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() provider_directory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() benefit_schedule?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pre_authorization?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() claim_reversal?: string;
}

export class CreateHmoIntegrationDto {
  @ApiProperty({ example: 'NHIF Integration' }) @IsString() integrationName: string;

  @ApiProperty({ enum: HmoIntegrationProvider }) @IsEnum(HmoIntegrationProvider) provider: HmoIntegrationProvider;

  @ApiPropertyOptional({ enum: IntegrationStatus, default: IntegrationStatus.INACTIVE })
  @IsOptional() @IsEnum(IntegrationStatus) status?: IntegrationStatus;

  @ApiPropertyOptional({ enum: AuthType, default: AuthType.API_KEY })
  @IsOptional() @IsEnum(AuthType) authType?: AuthType;

  @ApiPropertyOptional() @IsOptional() @IsObject() authConfig?: AuthConfigDto;

  @ApiProperty({ type: EndpointConfigDto }) @IsObject() endpoints: EndpointConfigDto;

  @ApiPropertyOptional() @IsOptional() @IsObject() requestHeaders?: Record<string, string>;

  @ApiPropertyOptional() @IsOptional() @IsObject() requestTransforms?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsObject() responseTransforms?: Record<string, any>;

  @ApiPropertyOptional({ default: 30000 }) @IsOptional() @IsNumber() @Min(1000) timeoutMs?: number;

  @ApiPropertyOptional({ default: 3 }) @IsOptional() @IsNumber() @Min(0) maxRetries?: number;
}

export class UpdateHmoIntegrationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() integrationName?: string;
  @ApiPropertyOptional({ enum: IntegrationStatus }) @IsOptional() @IsEnum(IntegrationStatus) status?: IntegrationStatus;
  @ApiPropertyOptional({ enum: AuthType }) @IsOptional() @IsEnum(AuthType) authType?: AuthType;
  @ApiPropertyOptional() @IsOptional() @IsObject() authConfig?: AuthConfigDto;
  @ApiPropertyOptional() @IsOptional() @IsObject() endpoints?: EndpointConfigDto;
  @ApiPropertyOptional() @IsOptional() @IsObject() requestHeaders?: Record<string, string>;
  @ApiPropertyOptional() @IsOptional() @IsObject() requestTransforms?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() responseTransforms?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1000) timeoutMs?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxRetries?: number;
}

export class HmoIntegrationQueryDto {
  @ApiPropertyOptional({ enum: HmoIntegrationProvider }) @IsOptional() @IsEnum(HmoIntegrationProvider) provider?: HmoIntegrationProvider;
  @ApiPropertyOptional({ enum: IntegrationStatus }) @IsOptional() @IsEnum(IntegrationStatus) status?: IntegrationStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
}

export class TestIntegrationDto {
  @ApiProperty({ enum: EndpointType }) @IsEnum(EndpointType) endpointType: EndpointType;
  @ApiPropertyOptional() @IsOptional() @IsObject() testPayload?: Record<string, any>;
}

export class EligibilityCheckDto {
  @ApiProperty() @IsString() memberNumber: string;
  @ApiProperty() @IsString() patientId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serviceCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() providerId?: string;
}

export class ClaimSubmissionDto {
  @ApiProperty() @IsString() claimId: string;
  @ApiProperty() @IsString() patientId: string;
  @ApiProperty() @IsArray() @IsString({ each: true }) serviceCodes: string[];
  @ApiProperty() @IsNumber() totalAmount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() diagnosisCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() providerId?: string;
}

export class RemittanceParseDto {
  @ApiProperty() @IsString() remittanceId: string;
  @ApiProperty() @IsString() rawData: string;
}

export class HmoApiLogQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() integrationId?: string;
  @ApiPropertyOptional({ enum: EndpointType }) @IsOptional() @IsEnum(EndpointType) endpointType?: EndpointType;
  @ApiPropertyOptional({ enum: LogDirection }) @IsOptional() @IsEnum(LogDirection) direction?: LogDirection;
  @ApiPropertyOptional({ enum: ApiLogStatus }) @IsOptional() @IsEnum(ApiLogStatus) status?: ApiLogStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clinicId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() correlationId?: string;
}