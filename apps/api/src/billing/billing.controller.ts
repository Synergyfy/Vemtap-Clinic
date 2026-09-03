import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto, CreatePaymentDto, InvoiceQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoices')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Create invoice' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  findAllInvoices(@Query() query: InvoiceQueryDto) {
    return this.billingService.findAllInvoices(query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOneInvoice(@Param('id') id: string) {
    return this.billingService.findOneInvoice(id);
  }

  @Put('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update invoice' })
  updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.billingService.updateInvoice(id, dto);
  }

  @Post('payments')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Record a payment' })
  makePayment(@Body() dto: CreatePaymentDto) {
    return this.billingService.makePayment(dto);
  }

  @Get('invoices/:id/payments')
  @ApiOperation({ summary: 'Get payments for an invoice' })
  getPayments(@Param('id') id: string) {
    return this.billingService.getPayments(id);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue summary' })
  getRevenue(@Query('clinicId') clinicId: string) {
    return this.billingService.getRevenue(clinicId);
  }
}
