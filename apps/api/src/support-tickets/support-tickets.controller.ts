import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto, UpdateSupportTicketDto, SupportTicketQueryDto, CreateTicketMessageDto, AssignTicketDto, ResolveTicketDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Support Tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@Body() dto: CreateSupportTicketDto, @Request() req: any) {
    return this.supportTicketsService.create(dto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'List support tickets with filters' })
  findAll(@Query() query: SupportTicketQueryDto) {
    return this.supportTicketsService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get ticket statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.supportTicketsService.getStats(clinicId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get ticket by ID with messages' })
  findOne(@Param('id') id: string) {
    return this.supportTicketsService.findOne(id);
  }

  @Get(':id/messages')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get ticket messages' })
  getMessages(@Param('id') id: string) {
    return this.supportTicketsService.getMessages(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update ticket' })
  update(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto, @Request() req: any) {
    return this.supportTicketsService.update(id, dto, req.user.sub);
  }

  @Put(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Assign ticket to staff' })
  assign(@Param('id') id: string, @Body() dto: AssignTicketDto, @Request() req: any) {
    return this.supportTicketsService.assign(id, dto, req.user.sub);
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Resolve ticket' })
  resolve(@Param('id') id: string, @Body() dto: ResolveTicketDto, @Request() req: any) {
    return this.supportTicketsService.resolve(id, dto, req.user.sub);
  }

  @Put(':id/close')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Close ticket' })
  close(@Param('id') id: string, @Request() req: any) {
    return this.supportTicketsService.close(id, req.user.sub);
  }

  @Put(':id/reopen')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Reopen ticket' })
  reopen(@Param('id') id: string, @Request() req: any) {
    return this.supportTicketsService.reopen(id, req.user.sub);
  }

  @Post(':id/messages')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Add message to ticket' })
  addMessage(@Param('id') id: string, @Body() dto: CreateTicketMessageDto, @Request() req: any) {
    return this.supportTicketsService.addMessage(id, { ...dto, ticketId: id }, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete ticket' })
  remove(@Param('id') id: string) {
    return this.supportTicketsService.remove(id);
  }
}