import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import {
  CancelSubscriptionDto,
  DowngradeSubscriptionDto,
  ListSubscriptionInvoicesQueryDto,
  UpgradeSubscriptionDto,
  VerifySubscriptionPaymentDto,
} from './dto';

@ApiTags('Subscription')
@Controller('subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available subscription plans' })
  listPlans() {
    return this.subscriptions.listPlans();
  }

  @Get('current')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Current plan, limits and usage for this clinic' })
  getCurrent(@CurrentUser() user: any) {
    return this.subscriptions.getCurrent(this.clinicId(user));
  }

  @Post('upgrade')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Upgrade (or change) the clinic plan' })
  upgrade(@CurrentUser() user: any, @Body() dto: UpgradeSubscriptionDto) {
    return this.subscriptions.upgrade(this.clinicId(user), dto, user?.sub);
  }

  @Post('downgrade')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Schedule a downgrade at the end of the period' })
  downgrade(@CurrentUser() user: any, @Body() dto: DowngradeSubscriptionDto) {
    return this.subscriptions.downgrade(this.clinicId(user), dto, user?.sub);
  }

  @Post('cancel')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Request cancellation (immediate or at period end)' })
  cancel(@CurrentUser() user: any, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptions.cancel(this.clinicId(user), dto, user?.sub);
  }

  @Get('invoices')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Billing history for this clinic' })
  listInvoices(@CurrentUser() user: any, @Query() query: ListSubscriptionInvoicesQueryDto) {
    return this.subscriptions.listInvoices(this.clinicId(user), query);
  }

  @Post('invoices/:id/pay')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Initialize a Paystack payment for an invoice' })
  payInvoice(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptions.payInvoice(this.clinicId(user), id);
  }

  @Post('payments/verify')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify a payment reference and activate the plan' })
  verifyPayment(@CurrentUser() user: any, @Body() dto: VerifySubscriptionPaymentDto) {
    return this.subscriptions.verifyPayment(this.clinicId(user), dto.reference, user?.sub);
  }

  @Get('events')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Subscription audit trail' })
  listEvents(@CurrentUser() user: any) {
    return this.subscriptions.listEvents(this.clinicId(user));
  }

  private clinicId(user: any): string {
    const clinicId = user?.clinicId;
    if (!clinicId) {
      throw new BadRequestException('This account is not attached to a clinic');
    }
    return clinicId;
  }
}
