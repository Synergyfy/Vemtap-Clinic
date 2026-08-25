import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { CreateQueueEntryDto, UpdateQueueEntryDto, QueueQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Queue')
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Add patient to queue' })
  create(@Body() dto: CreateQueueEntryDto) {
    return this.queueService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List queue entries' })
  findAll(@Query() query: QueueQueryDto) {
    return this.queueService.findAll(query);
  }

  @Get('next')
  @ApiOperation({ summary: 'Call next patient in queue' })
  callNext(@Query('clinicId') clinicId: string, @Query('branchId') branchId: string) {
    return this.queueService.callNext(clinicId, branchId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.queueService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get queue entry by ID' })
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(id);
  }

  @Put(':id/complete')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Mark queue entry as completed' })
  complete(@Param('id') id: string) {
    return this.queueService.complete(id);
  }

  @Put(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Cancel queue entry' })
  cancel(@Param('id') id: string) {
    return this.queueService.cancel(id);
  }
}
