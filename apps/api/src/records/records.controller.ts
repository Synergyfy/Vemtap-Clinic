import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, MedicalRecordQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Medical Records')
@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.OPTOMETRIST)
  @ApiOperation({ summary: 'Create medical record with vitals/eye test' })
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.recordsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List medical records' })
  findAll(@Query() query: MedicalRecordQueryDto) {
    return this.recordsService.findAll(query);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get patient medical history' })
  getPatientHistory(@Param('patientId') patientId: string) {
    return this.recordsService.getPatientHistory(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical record by ID' })
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Update medical record' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.recordsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Delete medical record' })
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
}
