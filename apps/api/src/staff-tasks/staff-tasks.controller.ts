import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffTasksService } from './staff-tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Staff Tasks')
@Controller('staff-tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffTasksController {
  constructor(private readonly staffTasksService: StaffTasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create staff task' })
  create(@Body() body: any) {
    return this.staffTasksService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List staff tasks' })
  findAll(@Query() query: any) {
    return this.staffTasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.staffTasksService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.staffTasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id') id: string) {
    return this.staffTasksService.remove(id);
  }
}
