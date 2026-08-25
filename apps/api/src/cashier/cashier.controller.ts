import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashierService } from './cashier.service';
import { OpenShiftDto, CloseShiftDto, ShiftQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
}
