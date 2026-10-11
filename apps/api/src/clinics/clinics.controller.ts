import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto, UpdateClinicDto, ClinicQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Clinics')
@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a clinic' })
  create(@Body() dto: CreateClinicDto) {
    return this.clinicsService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List clinics with filters' })
  findAll(@Query() query: ClinicQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get clinic statistics' })
  getStats() {
    return this.clinicsService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get clinic by ID' })
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update clinic' })
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