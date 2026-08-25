import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Patient Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit patient feedback' })
  create(@Body() body: any) {
    return this.feedbackService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List feedback' })
  findAll(@Query('clinicId') clinicId: string) {
    return this.feedbackService.findAll(clinicId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get feedback stats' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.feedbackService.getStats(clinicId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
