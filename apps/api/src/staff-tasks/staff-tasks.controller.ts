import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffTasksService } from './staff-tasks.service';
import { CreateStaffTaskDto, UpdateStaffTaskStatusDto, StaffTaskQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Staff Tasks')
@Controller('staff-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffTasksController {
  constructor(private readonly staffTasksService: StaffTasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Create staff task' })
  create(@Body() dto: CreateStaffTaskDto) {
    return this.staffTasksService.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'List staff tasks' })
  findAll(@Query() query: StaffTaskQueryDto) {
    return this.staffTasksService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.staffTasksService.findOne(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStaffTaskStatusDto) {
    return this.staffTasksService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id') id: string) {
    return this.staffTasksService.remove(id);
  }
}
