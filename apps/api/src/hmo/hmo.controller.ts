import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HmoService } from './hmo.service';
import {
  CreateHMODto, UpdateHMODto, CreateClaimDto, UpdateClaimDto,
  CreateAppealDto, UpdateAppealDto, CreateRemittanceDto, UpdateRemittanceDto,
  HMOQueryDto,   CreateHMOPlanDto, UpdateHMOPlanDto,
  CreateHMOAgreementDto, UpdateHMOAgreementDto, CoverageCheckDto,
  CreateAuthorizationDto, UpdateAuthorizationDto,
  CreateClaimBatchDto, UpdateClaimBatchDto, AddClaimsToBatchDto,
  UploadClaimDocumentDto, MatchRemittanceDto, AgingReportDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('HMO')
@Controller('hmo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HmoController {
  constructor(private readonly hmoService: HmoService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create HMO' })
  createHMO(@Body() dto: CreateHMODto) {
    return this.hmoService.createHMO(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List HMOs' })
  findAllHMOs(@Query() query: HMOQueryDto) {
    return this.hmoService.findAllHMOs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get HMO by ID' })
  findOneHMO(@Param('id') id: string) {
    return this.hmoService.findOneHMO(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update HMO' })
  updateHMO(@Param('id') id: string, @Body() dto: UpdateHMODto) {
    return this.hmoService.updateHMO(id, dto);
  }

  // --- Plans ---
  @Post('plans')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create HMO plan' })
  createPlan(@Body() dto: CreateHMOPlanDto) {
    return this.hmoService.createPlan(dto);
  }

  @Get('plans/:hmoId')
  @ApiOperation({ summary: 'List plans for an HMO' })
  findAllPlans(@Param('hmoId') hmoId: string) {
    return this.hmoService.findAllPlans(hmoId);
  }

  @Get('plans/detail/:id')
  @ApiOperation({ summary: 'Get plan by ID' })
  findOnePlan(@Param('id') id: string) {
    return this.hmoService.findOnePlan(id);
  }

  @Put('plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update HMO plan' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdateHMOPlanDto) {
    return this.hmoService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete HMO plan' })
  removePlan(@Param('id') id: string) {
    return this.hmoService.removePlan(id);
  }

  // --- Coverage Check ---
  @Post('coverage-check')
  @ApiOperation({ summary: 'Check coverage for a service' })
  checkCoverage(@Body() dto: CoverageCheckDto) {
    return this.hmoService.checkCoverage(dto);
  }

  // --- Agreements ---
  @Post('agreements')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create HMO agreement' })
  createAgreement(@Body() dto: CreateHMOAgreementDto) {
    return this.hmoService.createAgreement(dto);
  }

  @Get('agreements/:hmoId')
  @ApiOperation({ summary: 'List agreements for an HMO' })
  findAllAgreements(@Param('hmoId') hmoId: string, @Query('clinicId') clinicId: string) {
    return this.hmoService.findAllAgreements(hmoId, clinicId);
  }

  @Get('agreements/detail/:id')
  @ApiOperation({ summary: 'Get agreement by ID' })
  findOneAgreement(@Param('id') id: string) {
    return this.hmoService.findOneAgreement(id);
  }

  @Put('agreements/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update HMO agreement' })
  updateAgreement(@Param('id') id: string, @Body() dto: UpdateHMOAgreementDto) {
    return this.hmoService.updateAgreement(id, dto);
  }

  // --- Claims ---
  @Post('claims')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Submit HMO claim' })
  createClaim(@Body() dto: CreateClaimDto) {
    return this.hmoService.createClaim(dto);
  }

  @Get('claims/all')
  @ApiOperation({ summary: 'List HMO claims' })
  findAllClaims(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllClaims(clinicId);
  }

  @Put('claims/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update claim status' })
  updateClaim(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.hmoService.updateClaim(id, dto);
  }

  // --- Authorizations ---
  @Post('authorizations')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Request HMO authorization' })
  createAuthorization(@Body() dto: CreateAuthorizationDto) {
    return this.hmoService.createAuthorization(dto);
  }

  @Get('authorizations')
  @ApiOperation({ summary: 'List authorizations' })
  findAllAuthorizations(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllAuthorizations(clinicId);
  }

  @Get('authorizations/pending')
  @ApiOperation({ summary: 'Get pending authorizations' })
  getPendingAuthorizations(@Query('clinicId') clinicId: string) {
    return this.hmoService.getPendingAuthorizations(clinicId);
  }

  @Get('authorizations/:id')
  @ApiOperation({ summary: 'Get authorization by ID' })
  findOneAuthorization(@Param('id') id: string) {
    return this.hmoService.findOneAuthorization(id);
  }

  @Put('authorizations/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update authorization status' })
  updateAuthorization(@Param('id') id: string, @Body() dto: UpdateAuthorizationDto) {
    return this.hmoService.updateAuthorization(id, dto);
  }

  // --- Claims Batching ---
  @Post('batches')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create claim batch' })
  createBatch(@Body() dto: CreateClaimBatchDto) {
    return this.hmoService.createBatch(dto);
  }

  @Get('batches')
  @ApiOperation({ summary: 'List claim batches' })
  findAllBatches(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllBatches(clinicId);
  }

  @Put('batches/:id/add-claims')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add claims to batch' })
  addClaimsToBatch(@Param('id') id: string, @Body() dto: AddClaimsToBatchDto) {
    return this.hmoService.addClaimsToBatch(id, dto);
  }

  @Put('batches/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update batch status' })
  updateBatch(@Param('id') id: string, @Body() dto: UpdateClaimBatchDto) {
    return this.hmoService.updateBatch(id, dto);
  }

  // --- Claim Documents ---
  @Post('documents')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Upload claim document' })
  uploadDocument(@Body() dto: UploadClaimDocumentDto) {
    return this.hmoService.uploadDocument(dto);
  }

  @Get('documents/:claimId')
  @ApiOperation({ summary: 'Get documents for a claim' })
  findDocuments(@Param('claimId') claimId: string) {
    return this.hmoService.findDocumentsByClaim(claimId);
  }

  @Delete('documents/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete claim document' })
  removeDocument(@Param('id') id: string) {
    return this.hmoService.removeDocument(id);
  }

  // --- Appeals ---
  @Post('appeals')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Submit appeal' })
  createAppeal(@Body() dto: CreateAppealDto) {
    return this.hmoService.createAppeal(dto);
  }

  @Put('appeals/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update appeal status' })
  updateAppeal(@Param('id') id: string, @Body() dto: UpdateAppealDto) {
    return this.hmoService.updateAppeal(id, dto);
  }

  // --- Remittances ---
  @Post('remittances')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Record remittance' })
  createRemittance(@Body() dto: CreateRemittanceDto) {
    return this.hmoService.createRemittance(dto);
  }

  @Get('remittances/all')
  @ApiOperation({ summary: 'List remittances' })
  findAllRemittances(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllRemittances(clinicId);
  }

  @Put('remittances/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update remittance' })
  updateRemittance(@Param('id') id: string, @Body() dto: UpdateRemittanceDto) {
    return this.hmoService.updateRemittance(id, dto);
  }

  @Put('remittances/:id/match')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Match remittance to claims' })
  matchRemittance(@Param('id') id: string, @Body() dto: MatchRemittanceDto) {
    return this.hmoService.matchRemittance(id, dto.claimIds);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get HMO aging report' })
  getAgingReport(@Query() query: AgingReportDto) {
    return this.hmoService.getAgingReport(query);
  }

  @Get('totals')
  @ApiOperation({ summary: 'Get HMO totals by HMO' })
  getHMOTotals(@Query('clinicId') clinicId: string) {
    return this.hmoService.getHMOTotals(clinicId);
  }

  // --- Stats ---
  @Get('stats')
  @ApiOperation({ summary: 'Get HMO statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.hmoService.getStats(clinicId);
  }
}
