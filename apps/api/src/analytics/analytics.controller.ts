import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get revenue summary' })
  getRevenue(@Query('clinicId') clinicId: string) {
    return this.service.getRevenueSummary(clinicId);
  }

  @Get('staff-kpis')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get staff KPIs' })
  getStaffKPIs(@Query('clinicId') clinicId: string) {
    return this.service.getStaffKPIs(clinicId);
  }

  @Get('queue-analytics')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get queue analytics' })
  getQueueAnalytics(@Query('clinicId') clinicId: string) {
    return this.service.getQueueAnalytics(clinicId);
  }

  @Get('appointment-trends')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Get appointment trends' })
  getAppointmentTrends(@Query('clinicId') clinicId: string) {
    return this.service.getAppointmentTrends(clinicId);
  }

  @Get('optical')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get optical analytics' })
  getOpticalAnalytics(@Query('clinicId') clinicId: string) {
    return this.service.getOpticalAnalytics(clinicId);
  }
}
