import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.CASHIER, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get clinic dashboard overview' })
  getClinicDashboard(@Query('clinicId') clinicId: string) {
    return this.dashboardService.getClinicDashboard(clinicId);
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get revenue report by date range' })
  getRevenueReport(
    @Query('clinicId') clinicId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getRevenueReport(clinicId, startDate, endDate);
  }

  @Get('appointments')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get appointment analytics' })
  getAppointmentAnalytics(
    @Query('clinicId') clinicId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getAppointmentAnalytics(clinicId, startDate, endDate);
  }

  @Get('hmo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get HMO claims analytics' })
  getHMOAnalytics(@Query('clinicId') clinicId: string) {
    return this.dashboardService.getHMOAnalytics(clinicId);
  }
}
