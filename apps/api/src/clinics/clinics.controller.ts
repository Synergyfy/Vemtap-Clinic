import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto, UpdateClinicDto, ClinicQueryDto } from './dto/clinic.dto';

@ApiTags('Clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get('platform-overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get multi-clinic platform overview for Super Admin' })
  getPlatformOverview() {
    return this.clinicsService.getPlatformOverview();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get total, active, and inactive clinic statistics' })
  getStats() {
    return this.clinicsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clinic details by ID' })
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all clinics with optional search and active status filters' })
  findAll(@Query() query: ClinicQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register/Onboard a new clinic' })
  create(@Body() dto: CreateClinicDto) {
    return this.clinicsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update clinic profile' })
  update(@Param('id') id: string, @Body() dto: UpdateClinicDto) {
    return this.clinicsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete clinic' })
  remove(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }
}
