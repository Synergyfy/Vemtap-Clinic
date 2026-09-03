import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientDocumentsService } from './patient-documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Patient Documents')
@Controller('patient-documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientDocumentsController {
  constructor(private readonly patientDocumentsService: PatientDocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload patient document' })
  create(@Body() body: any) {
    return this.patientDocumentsService.create(body);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get patient documents' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.patientDocumentsService.findByPatient(patientId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.patientDocumentsService.remove(id);
  }
}
