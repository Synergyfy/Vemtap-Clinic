import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Patient Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Submit patient feedback' })
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'List feedback' })
  findAll(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.findAll(query.clinicId!);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get feedback stats' })
  getStats(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.getStats(query.clinicId!);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete feedback' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
