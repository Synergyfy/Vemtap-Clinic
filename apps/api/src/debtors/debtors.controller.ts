import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DebtorsService } from './debtors.service';
import {
  CreateDebtorDto, UpdateDebtorDto, DebtorQueryDto, AgingReportDto,
  CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlanQueryDto,
  CreateCollectionActivityDto, UpdateCollectionActivityDto, CollectionActivityQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Debtors & Receivables')
@Controller('debtors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DebtorsController {
  constructor(private readonly debtorsService: DebtorsService) {}

  // ========== Debtors ==========
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create debtor record' })
  createDebtor(@Body() dto: CreateDebtorDto, @Query('clinicId') clinicId: string) {
    return this.debtorsService.createDebtor(dto, clinicId);
  }

  @Get()
  @ApiOperation({ summary: 'List debtors' })
  findDebtors(@Query() query: DebtorQueryDto) {
    return this.debtorsService.findDebtors(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get debtors statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.debtorsService.getStats(clinicId);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Get aging report' })
  getAgingReport(@Query() query: AgingReportDto) {
    return this.debtorsService.getAgingReport(query);
  }

  @Post('recalculate')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Recalculate debtor balances from invoices' })
  recalculate(@Query('clinicId') clinicId: string, @Query('asOfDate') asOfDate?: string) {
    return this.debtorsService.recalculateDebtorBalances(clinicId, asOfDate ? new Date(asOfDate) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debtor by ID' })
  findDebtor(@Param('id') id: string) {
    return this.debtorsService.findDebtorById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update debtor' })
  updateDebtor(@Param('id') id: string, @Body() dto: UpdateDebtorDto) {
    return this.debtorsService.updateDebtor(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete debtor (only if settled)' })
  deleteDebtor(@Param('id') id: string) {
    return this.debtorsService.deleteDebtor(id);
  }

  // ========== Payment Plans ==========
  @Post('payment-plans')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create payment plan' })
  createPaymentPlan(@Body() dto: CreatePaymentPlanDto, @Query('clinicId') clinicId: string) {
    return this.debtorsService.createPaymentPlan(dto, clinicId);
  }

  @Get('payment-plans')
  @ApiOperation({ summary: 'List payment plans' })
  findPaymentPlans(@Query() query: PaymentPlanQueryDto) {
    return this.debtorsService.findPaymentPlans(query);
  }

  @Get('payment-plans/:id')
  @ApiOperation({ summary: 'Get payment plan by ID' })
  findPaymentPlan(@Param('id') id: string) {
    return this.debtorsService.findPaymentPlanById(id);
  }

  @Put('payment-plans/:id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update payment plan' })
  updatePaymentPlan(@Param('id') id: string, @Body() dto: UpdatePaymentPlanDto) {
    return this.debtorsService.updatePaymentPlan(id, dto);
  }

  // ========== Collection Activities ==========
  @Post('activities')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Log collection activity' })
  createActivity(@Body() dto: CreateCollectionActivityDto, @CurrentUser() user: any, @Query('clinicId') clinicId: string) {
    return this.debtorsService.createCollectionActivity(dto, clinicId, user.sub);
  }

  @Get('activities')
  @ApiOperation({ summary: 'List collection activities' })
  findActivities(@Query() query: CollectionActivityQueryDto) {
    return this.debtorsService.findCollectionActivities(query);
  }

  @Put('activities/:id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update collection activity' })
  updateActivity(@Param('id') id: string, @Body() dto: UpdateCollectionActivityDto) {
    return this.debtorsService.updateCollectionActivity(id, dto);
  }
}