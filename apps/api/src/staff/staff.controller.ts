import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create staff member' })
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List staff members' })
  findAll(@Query() query: StaffQueryDto) {
    return this.staffService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member' })
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete staff member' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get staff statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.staffService.getStats(clinicId);
  }
}
