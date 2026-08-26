import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import {
  CreateReturnRequestDto, UpdateReturnRequestDto, ReviewReturnDto, ReceiveReturnDto, ReturnRequestQueryDto,
  CreateRefundDto, ProcessRefundDto, RefundQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Returns & Refunds')
@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // ========== Return Requests ==========
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create return request' })
  createReturn(@Body() dto: CreateReturnRequestDto, @Query('clinicId') clinicId: string) {
    return this.returnsService.createReturnRequest(dto, clinicId);
  }

  @Get()
  @ApiOperation({ summary: 'List return requests' })
  findReturns(@Query() query: ReturnRequestQueryDto) {
    return this.returnsService.findReturnRequests(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get returns statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.returnsService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return request by ID' })
  findReturn(@Param('id') id: string) {
    return this.returnsService.findReturnById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update return request (only REQUESTED status)' })
  updateReturn(@Param('id') id: string, @Body() dto: UpdateReturnRequestDto) {
    return this.returnsService.updateReturnRequest(id, dto);
  }

  @Put(':id/review')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Review return request (approve/reject)' })
  reviewReturn(@Param('id') id: string, @Body() dto: ReviewReturnDto, @CurrentUser() user: any) {
    return this.returnsService.reviewReturn(id, dto, user.sub);
  }

  @Put(':id/receive')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.NURSE)
  @ApiOperation({ summary: 'Receive returned items and restore inventory' })
  receiveReturn(@Param('id') id: string, @Body() dto: ReceiveReturnDto, @CurrentUser() user: any) {
    return this.returnsService.receiveReturn(id, dto, user.sub);
  }

  @Put(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Complete return request' })
  completeReturn(@Param('id') id: string) {
    return this.returnsService.completeReturn(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete return request (only REQUESTED/REJECTED)' })
  deleteReturn(@Param('id') id: string) {
    return this.returnsService.deleteReturnRequest(id);
  }

  // ========== Refunds ==========
  @Post('refunds')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create refund for approved return' })
  createRefund(@Body() dto: CreateRefundDto, @Query('clinicId') clinicId: string) {
    return this.returnsService.createRefund(dto, clinicId);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'List refunds' })
  findRefunds(@Query() query: RefundQueryDto) {
    return this.returnsService.findRefunds(query);
  }

  @Get('refunds/:id')
  @ApiOperation({ summary: 'Get refund by ID' })
  findRefund(@Param('id') id: string) {
    return this.returnsService.findRefundById(id);
  }

  @Put('refunds/:id/process')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: 'Process refund (complete/fail/cancel)' })
  processRefund(@Param('id') id: string, @Body() dto: ProcessRefundDto, @CurrentUser() user: any) {
    return this.returnsService.processRefund(id, dto, user.sub);
  }

  @Delete('refunds/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete refund (only PENDING/CANCELLED)' })
  deleteRefund(@Param('id') id: string) {
    return this.returnsService.deleteRefund(id);
  }
}