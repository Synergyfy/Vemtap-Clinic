import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashierService } from './cashier.service';
import { OpenShiftDto, CloseShiftDto, ShiftQueryDto, CompleteTransactionDto, CreateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Cashier')
@Controller('cashier')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Post('shifts/open')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Open a cashier shift' })
  openShift(@Body() dto: OpenShiftDto) {
    return this.cashierService.openShift(dto);
  }

  @Put('shifts/:id/close')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Close a cashier shift' })
  closeShift(@Param('id') id: string, @Body() dto: CloseShiftDto) {
    return this.cashierService.closeShift(id, dto);
  }

  @Get('shifts')
  @ApiOperation({ summary: 'List shifts' })
  findAll(@Query() query: ShiftQueryDto) {
    return this.cashierService.findAll(query);
  }

  @Get('shifts/:id')
  @ApiOperation({ summary: 'Get shift by ID' })
  findOne(@Param('id') id: string) {
    return this.cashierService.findOne(id);
  }

  @Get('shifts/open/:staffId')
  @ApiOperation({ summary: 'Get open shift for staff' })
  getOpenShift(@Param('staffId') staffId: string) {
    return this.cashierService.getOpenShift(staffId);
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily shift summary' })
  getDailySummary(@Query('clinicId') clinicId: string) {
    return this.cashierService.getDailySummary(clinicId);
  }

  // ========== Transaction Endpoints ==========
  @Post('transactions')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Complete a transaction' })
  completeTransaction(@Body() dto: CompleteTransactionDto, @CurrentUser() user: any) {
    return this.cashierService.completeTransaction(dto, user.firstName + ' ' + user.lastName);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions' })
  findTransactions(@Query('clinicId') clinicId?: string) {
    return this.cashierService.findTransactions(clinicId);
  }

  @Get('transactions/stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  getTransactionStats(@Query('clinicId') clinicId: string) {
    return this.cashierService.getTransactionStats(clinicId);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findTransaction(@Param('id') id: string) {
    return this.cashierService.findTransactionById(id);
  }

  @Put('transactions/:id/void')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Void a transaction' })
  voidTransaction(@Param('id') id: string) {
    return this.cashierService.voidTransaction(id);
  }

  // ========== Product Endpoints ==========
  @Post('products')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create POS product' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.cashierService.createProduct(dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'List POS products' })
  findProducts(@Query('clinicId') clinicId?: string) {
    return this.cashierService.findProducts(clinicId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  findProduct(@Param('id') id: string) {
    return this.cashierService.findProductById(id);
  }

  @Put('products/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: any) {
    return this.cashierService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete product' })
  deleteProduct(@Param('id') id: string) {
    return this.cashierService.deleteProduct(id);
  }
}