import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HmoIntegrationsService } from './hmo-integrations.service';
import {
  CreateHmoIntegrationDto, UpdateHmoIntegrationDto, HmoIntegrationQueryDto,
  TestIntegrationDto, EligibilityCheckDto, ClaimSubmissionDto, RemittanceParseDto, HmoApiLogQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('HMO Integrations')
@Controller('hmo-integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HmoIntegrationsController {
  constructor(private readonly hmoIntegrationsService: HmoIntegrationsService) {}

  // ========== Integrations ==========
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create HMO integration' })
  createIntegration(@Body() dto: CreateHmoIntegrationDto, @Query('clinicId') clinicId: string) {
    return this.hmoIntegrationsService.createIntegration(dto, clinicId);
  }

  @Get()
  @ApiOperation({ summary: 'List HMO integrations' })
  findIntegrations(@Query() query: HmoIntegrationQueryDto) {
    return this.hmoIntegrationsService.findIntegrations(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get integration statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.hmoIntegrationsService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  findIntegration(@Param('id') id: string) {
    return this.hmoIntegrationsService.findIntegrationById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update integration' })
  updateIntegration(@Param('id') id: string, @Body() dto: UpdateHmoIntegrationDto) {
    return this.hmoIntegrationsService.updateIntegration(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete integration' })
  deleteIntegration(@Param('id') id: string) {
    return this.hmoIntegrationsService.deleteIntegration(id);
  }

  // ========== Testing ==========
  @Post(':id/test')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test integration endpoint' })
  testIntegration(@Param('id') id: string, @Body() dto: TestIntegrationDto) {
    return this.hmoIntegrationsService.testIntegration(id, dto);
  }

  // ========== API Operations ==========
  @Post(':id/eligibility')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.CASHIER)
  @ApiOperation({ summary: 'Check patient eligibility' })
  checkEligibility(@Param('id') id: string, @Body() dto: EligibilityCheckDto) {
    return this.hmoIntegrationsService.checkEligibility(id, dto);
  }

  @Post(':id/claims')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.CASHIER)
  @ApiOperation({ summary: 'Submit claim to HMO' })
  submitClaim(@Param('id') id: string, @Body() dto: ClaimSubmissionDto) {
    return this.hmoIntegrationsService.submitClaim(id, dto);
  }

  @Get(':id/claims/:claimId/status')
  @ApiOperation({ summary: 'Check claim status' })
  checkClaimStatus(@Param('id') id: string, @Param('claimId') claimId: string) {
    return this.hmoIntegrationsService.checkClaimStatus(id, claimId);
  }

  @Post(':id/remittance')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Parse remittance advice' })
  parseRemittance(@Param('id') id: string, @Body() dto: RemittanceParseDto) {
    return this.hmoIntegrationsService.parseRemittance(id, dto);
  }

  // ========== Logs ==========
  @Get('logs')
  @ApiOperation({ summary: 'List API logs' })
  findLogs(@Query() query: HmoApiLogQueryDto) {
    return this.hmoIntegrationsService.findLogs(query);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get API log by ID' })
  findLog(@Param('id') id: string) {
    return this.hmoIntegrationsService.findLogById(id);
  }
}