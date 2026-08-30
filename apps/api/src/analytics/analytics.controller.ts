import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue summary' })
  getRevenue(@Query('clinicId') clinicId: string) {
    return this.service.getRevenueSummary(clinicId);
  }

  @Get('staff-kpis')
  @ApiOperation({ summary: 'Get staff KPIs' })
  getStaffKPIs(@Query('clinicId') clinicId: string) {
    return this.service.getStaffKPIs(clinicId);
  }

  @Get('queue-analytics')
  @ApiOperation({ summary: 'Get queue analytics' })
  getQueueAnalytics(@Query('clinicId') clinicId: string) {
    return this.service.getQueueAnalytics(clinicId);
  }

  @Get('appointment-trends')
  @ApiOperation({ summary: 'Get appointment trends' })
  getAppointmentTrends(@Query('clinicId') clinicId: string) {
    return this.service.getAppointmentTrends(clinicId);
  }

  @Get('optical')
  @ApiOperation({ summary: 'Get optical analytics' })
  getOpticalAnalytics(@Query('clinicId') clinicId: string) {
    return this.service.getOpticalAnalytics(clinicId);
  }
}
