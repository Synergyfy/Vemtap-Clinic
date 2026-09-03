import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ObservationNotesService } from './observation-notes.service';
import { CreateObservationNoteDto, ObservationNoteQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Observation Notes')
@Controller('observation-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ObservationNotesController {
  constructor(private readonly observationNotesService: ObservationNotesService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Create observation note' })
  create(@Body() dto: CreateObservationNoteDto, @CurrentUser() user: any) {
    return this.observationNotesService.create({ ...dto, staffId: user.sub });
  }

  @Get()
  @ApiOperation({ summary: 'List observation notes' })
  findAll(@Query() query: ObservationNoteQueryDto) {
    if (query.patientId) return this.observationNotesService.findByPatient(query.patientId);
    if (query.clinicId) return this.observationNotesService.findByClinic(query.clinicId);
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get observation note by ID' })
  findOne(@Param('id') id: string) {
    return this.observationNotesService.findById(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete observation note' })
  remove(@Param('id') id: string) {
    return this.observationNotesService.remove(id);
  }
}