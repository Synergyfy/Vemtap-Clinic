import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SurgeryService } from './surgery.service';
import {
  CreateProcedureDto, UpdateProcedureDto, ProcedureQueryDto,
  CreateOperatingRoomDto, UpdateOperatingRoomDto, OperatingRoomQueryDto,
  CreateSurgeryScheduleDto, UpdateSurgeryScheduleDto, SurgeryScheduleQueryDto, AvailableSlotsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Surgery')
@Controller('surgery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SurgeryController {
  constructor(private readonly surgeryService: SurgeryService) {}

  // ========== Procedures ==========
  @Post('procedures')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create surgical procedure' })
  createProcedure(@Body() dto: CreateProcedureDto, @Query('clinicId') clinicId: string) {
    return this.surgeryService.createProcedure(dto, clinicId);
  }

  @Get('procedures')
  @ApiOperation({ summary: 'List surgical procedures' })
  findProcedures(@Query() query: ProcedureQueryDto) {
    return this.surgeryService.findProcedures(query);
  }

  @Get('procedures/:id')
  @ApiOperation({ summary: 'Get procedure by ID' })
  findProcedure(@Param('id') id: string) {
    return this.surgeryService.findProcedureById(id);
  }

  @Put('procedures/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update procedure' })
  updateProcedure(@Param('id') id: string, @Body() dto: UpdateProcedureDto) {
    return this.surgeryService.updateProcedure(id, dto);
  }

  @Delete('procedures/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete procedure' })
  deleteProcedure(@Param('id') id: string) {
    return this.surgeryService.deleteProcedure(id);
  }

  // ========== Operating Rooms ==========
  @Post('rooms')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create operating room' })
  createRoom(@Body() dto: CreateOperatingRoomDto, @Query('clinicId') clinicId: string) {
    return this.surgeryService.createOperatingRoom(dto, clinicId);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List operating rooms' })
  findRooms(@Query() query: OperatingRoomQueryDto) {
    return this.surgeryService.findOperatingRooms(query);
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get operating room by ID' })
  findRoom(@Param('id') id: string) {
    return this.surgeryService.findOperatingRoomById(id);
  }

  @Put('rooms/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update operating room' })
  updateRoom(@Param('id') id: string, @Body() dto: UpdateOperatingRoomDto) {
    return this.surgeryService.updateOperatingRoom(id, dto);
  }

  @Delete('rooms/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete operating room' })
  deleteRoom(@Param('id') id: string) {
    return this.surgeryService.deleteOperatingRoom(id);
  }

  // ========== Surgery Schedules ==========
  @Post('schedules')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Schedule surgery' })
  createSchedule(@Body() dto: CreateSurgeryScheduleDto, @Query('clinicId') clinicId: string) {
    return this.surgeryService.createSchedule(dto, clinicId);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List surgery schedules' })
  findSchedules(@Query() query: SurgeryScheduleQueryDto) {
    return this.surgeryService.findSchedules(query);
  }

  @Get('schedules/available-slots')
  @ApiOperation({ summary: 'Get available time slots for OR' })
  getAvailableSlots(@Query() query: AvailableSlotsDto) {
    return this.surgeryService.getAvailableSlots(query);
  }

  @Get('schedules/stats')
  @ApiOperation({ summary: 'Get surgery schedule statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.surgeryService.getScheduleStats(clinicId);
  }

  @Get('schedules/:id')
  @ApiOperation({ summary: 'Get surgery schedule by ID' })
  findSchedule(@Param('id') id: string) {
    return this.surgeryService.findScheduleById(id);
  }

  @Put('schedules/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update surgery schedule' })
  updateSchedule(@Param('id') id: string, @Body() dto: UpdateSurgeryScheduleDto) {
    return this.surgeryService.updateSchedule(id, dto);
  }

  @Delete('schedules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete surgery schedule' })
  deleteSchedule(@Param('id') id: string) {
    return this.surgeryService.deleteSchedule(id);
  }
}