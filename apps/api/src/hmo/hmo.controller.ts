import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HmoService } from './hmo.service';
import { CreateHMODto, UpdateHMODto, CreateClaimDto, UpdateClaimDto, CreateAppealDto, UpdateAppealDto, CreateRemittanceDto, UpdateRemittanceDto, HMOQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('HMO')
@Controller('hmo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HmoController {
  constructor(private readonly hmoService: HmoService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create HMO' })
  createHMO(@Body() dto: CreateHMODto) {
    return this.hmoService.createHMO(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List HMOs' })
  findAllHMOs(@Query() query: HMOQueryDto) {
    return this.hmoService.findAllHMOs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get HMO by ID' })
  findOneHMO(@Param('id') id: string) {
    return this.hmoService.findOneHMO(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update HMO' })
  updateHMO(@Param('id') id: string, @Body() dto: UpdateHMODto) {
    return this.hmoService.updateHMO(id, dto);
  }

  @Post('claims')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Submit HMO claim' })
  createClaim(@Body() dto: CreateClaimDto) {
    return this.hmoService.createClaim(dto);
  }

  @Get('claims/all')
  @ApiOperation({ summary: 'List HMO claims' })
  findAllClaims(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllClaims(clinicId);
  }

  @Put('claims/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update claim status' })
  updateClaim(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    return this.hmoService.updateClaim(id, dto);
  }

  @Post('appeals')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Submit appeal' })
  createAppeal(@Body() dto: CreateAppealDto) {
    return this.hmoService.createAppeal(dto);
  }

  @Put('appeals/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update appeal status' })
  updateAppeal(@Param('id') id: string, @Body() dto: UpdateAppealDto) {
    return this.hmoService.updateAppeal(id, dto);
  }

  @Post('remittances')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Record remittance' })
  createRemittance(@Body() dto: CreateRemittanceDto) {
    return this.hmoService.createRemittance(dto);
  }

  @Get('remittances/all')
  @ApiOperation({ summary: 'List remittances' })
  findAllRemittances(@Query('clinicId') clinicId: string) {
    return this.hmoService.findAllRemittances(clinicId);
  }

  @Put('remittances/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update remittance' })
  updateRemittance(@Param('id') id: string, @Body() dto: UpdateRemittanceDto) {
    return this.hmoService.updateRemittance(id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get HMO statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.hmoService.getStats(clinicId);
  }
}
