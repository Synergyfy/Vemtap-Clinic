import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalReportingService } from './clinical-reporting.service';
import {
  CreateReportTemplateDto, UpdateReportTemplateDto, ReportTemplateQueryDto,
  GenerateReportDto, GeneratedReportQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Clinical Reporting')
@Controller('clinical-reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClinicalReportingController {
  constructor(private readonly clinicalReportingService: ClinicalReportingService) {}

  // ========== Templates ==========
  @Post('templates')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create report template' })
  createTemplate(@Body() dto: CreateReportTemplateDto, @CurrentUser() user: any, @Query('clinicId') clinicId: string) {
    return this.clinicalReportingService.createTemplate(dto, clinicId, user.sub);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List report templates' })
  findTemplates(@Query() query: ReportTemplateQueryDto) {
    return this.clinicalReportingService.findTemplates(query);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  findTemplate(@Param('id') id: string) {
    return this.clinicalReportingService.findTemplateById(id);
  }

  @Put('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update template' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateReportTemplateDto) {
    return this.clinicalReportingService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete template' })
  deleteTemplate(@Param('id') id: string) {
    return this.clinicalReportingService.deleteTemplate(id);
  }

  // ========== Generated Reports ==========
  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Generate report from template' })
  generate(@Body() dto: GenerateReportDto, @CurrentUser() user: any, @Query('clinicId') clinicId: string) {
    return this.clinicalReportingService.generateReport(dto, clinicId, user.sub);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List generated reports' })
  findReports(@Query() query: GeneratedReportQueryDto) {
    return this.clinicalReportingService.findReports(query);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get generated report by ID' })
  findReport(@Param('id') id: string) {
    return this.clinicalReportingService.findReportById(id);
  }

  @Delete('reports/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete generated report' })
  deleteReport(@Param('id') id: string) {
    return this.clinicalReportingService.deleteReport(id);
  }

  // ========== Stats ==========
  @Get('stats')
  @ApiOperation({ summary: 'Get reporting statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.clinicalReportingService.getStats(clinicId);
  }

  @Get('scheduled')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get scheduled templates' })
  getScheduled() {
    return this.clinicalReportingService.getScheduledTemplates();
  }
}