import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateDemoRequestDto } from './dto';
import { DemoRequestsService } from './demo-requests.service';

@ApiTags('Demo Requests')
@Controller('demo-requests')
export class DemoRequestsController {
  constructor(private readonly demoRequestsService: DemoRequestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List submitted demo requests (admin only)' })
  findAll() {
    return this.demoRequestsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new demo request from the public booking form' })
  create(@Body() dto: CreateDemoRequestDto) {
    return this.demoRequestsService.create(dto);
  }
}
