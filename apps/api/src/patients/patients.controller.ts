import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a patient' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List patients with pagination' })
  findAll(@Query() query: PatientQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete patient' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get patient statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.patientsService.getStats(clinicId);
  }

  @Get('hmo/:hmoName')
  @ApiOperation({ summary: 'Get patients by HMO' })
  findByHMO(@Param('hmoName') hmoName: string, @Query('clinicId') clinicId: string) {
    return this.patientsService.findByHMO(hmoName, clinicId);
  }

  @Get(':id/hmo-eligibility')
  @ApiOperation({ summary: 'Check patient HMO eligibility for a service' })
  checkHMOEligibility(
    @Param('id') id: string,
    @Query('serviceType') serviceType: string,
    @Query('serviceAmount') serviceAmount: number,
  ) {
    return this.patientsService.checkHMOEligibility(id, serviceType, serviceAmount);
  }
}
