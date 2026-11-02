import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateSupportTicketDto, SupportTicketQueryDto } from './dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('Support Tickets')
@Controller('support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'List support tickets for a clinic' })
  findAll(@Query() query: SupportTicketQueryDto) {
    return this.supportTicketsService.findAll(query.clinicId);
  }

  @Get('stats')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Get support ticket stats' })
  getStats(@Query() query: SupportTicketQueryDto) {
    return this.supportTicketsService.getStats(query.clinicId);
  }

  @Put(':id/resolve')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Resolve a support ticket' })
  resolve(@Param('id') id: string, @Body('resolutionNotes') resolutionNotes?: string) {
    return this.supportTicketsService.resolve(id, resolutionNotes);
  }

  @Put(':id/close')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Close a support ticket' })
  close(@Param('id') id: string) {
    return this.supportTicketsService.close(id);
  }

  @Put(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Alias update route for support ticket operations' })
  update(@Param('id') id: string) {
    return this.supportTicketsService.close(id);
  }

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
    UserRole.PHARMACIST,
    UserRole.OPTOMETRIST,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@Body() dto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(dto);
  }
}
