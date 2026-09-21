import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientDocumentsService } from './patient-documents.service';
import { CreatePatientDocumentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Patient Documents')
@Controller('patient-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatientDocumentsController {
  constructor(private readonly patientDocumentsService: PatientDocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Upload patient document' })
  create(@Body() dto: CreatePatientDocumentDto) {
    return this.patientDocumentsService.create(dto);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get patient documents' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.patientDocumentsService.findByPatient(patientId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.patientDocumentsService.remove(id);
  }
}
