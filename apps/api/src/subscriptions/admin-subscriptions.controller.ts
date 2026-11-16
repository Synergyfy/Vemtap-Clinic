import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import {
  AdminListSubscriptionsQueryDto,
  AdminOverrideSubscriptionDto,
  CreateSubscriptionPlanDto,
  RecordManualSubscriptionPaymentDto,
  UpdateSubscriptionPlanDto,
} from './dto';

@ApiTags('Admin - Subscriptions')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List every plan, including inactive ones' })
  listPlans() {
    return this.subscriptions.listPlans(true);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a subscription plan' })
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptions.createPlan(dto);
  }

  @Put('plans/:code')
  @ApiOperation({ summary: 'Update a subscription plan' })
  updatePlan(@Param('code') code: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.subscriptions.updatePlan(code, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List clinic subscriptions' })
  list(@Query() query: AdminListSubscriptionsQueryDto) {
    return this.subscriptions.adminListSubscriptions(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform subscription totals and MRR' })
  stats() {
    return this.subscriptions.adminStats();
  }

  @Get(':clinicId')
  @ApiOperation({ summary: 'Subscription detail for one clinic' })
  detail(@Param('clinicId') clinicId: string) {
    return this.subscriptions.getCurrent(clinicId);
  }

  @Post(':clinicId/override')
  @ApiOperation({ summary: 'Override plan, status, grace period or renewal date' })
  override(
    @Param('clinicId') clinicId: string,
    @Body() dto: AdminOverrideSubscriptionDto,
    @CurrentUser() user: any
  ) {
    return this.subscriptions.adminOverride(clinicId, dto, user?.sub);
  }

  @Post(':clinicId/invoices/:invoiceId/manual-payment')
  @ApiOperation({ summary: 'Record a manual (offline) payment and activate the plan' })
  recordManualPayment(
    @Param('clinicId') clinicId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() dto: RecordManualSubscriptionPaymentDto,
    @CurrentUser() user: any
  ) {
    return this.subscriptions.recordManualPayment(clinicId, invoiceId, dto, user?.sub);
  }
}
