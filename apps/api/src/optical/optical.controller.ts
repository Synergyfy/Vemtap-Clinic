import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpticalService } from './optical.service';
import { CreateOpticalItemDto, UpdateOpticalItemDto, CreateLensOrderDto, UpdateLensOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Optical')
@Controller('optical')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OpticalController {
  constructor(private readonly opticalService: OpticalService) {}

  @Post('items')
  @Roles(UserRole.ADMIN, UserRole.OPTOMETRIST)
  @ApiOperation({ summary: 'Add optical inventory item' })
  createItem(@Body() dto: CreateOpticalItemDto) {
    return this.opticalService.createItem(dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List optical inventory' })
  findAllItems(@Query('clinicId') clinicId: string) {
    return this.opticalService.findAllItems(clinicId);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get optical item by ID' })
  findOneItem(@Param('id') id: string) {
    return this.opticalService.findOneItem(id);
  }

  @Put('items/:id')
  @Roles(UserRole.ADMIN, UserRole.OPTOMETRIST)
  @ApiOperation({ summary: 'Update optical item' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateOpticalItemDto) {
    return this.opticalService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete optical item' })
  removeItem(@Param('id') id: string) {
    return this.opticalService.removeItem(id);
  }

  @Post('lens-orders')
  @Roles(UserRole.DOCTOR, UserRole.OPTOMETRIST)
  @ApiOperation({ summary: 'Create lens order' })
  createLensOrder(@Body() dto: CreateLensOrderDto) {
    return this.opticalService.createLensOrder(dto);
  }

  @Get('lens-orders')
  @ApiOperation({ summary: 'List lens orders' })
  findAllLensOrders(@Query('clinicId') clinicId: string) {
    return this.opticalService.findAllLensOrders(clinicId);
  }

  @Put('lens-orders/:id')
  @Roles(UserRole.ADMIN, UserRole.OPTOMETRIST)
  @ApiOperation({ summary: 'Update lens order status' })
  updateLensOrder(@Param('id') id: string, @Body() dto: UpdateLensOrderDto) {
    return this.opticalService.updateLensOrder(id, dto);
  }
}
