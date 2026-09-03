import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DrugsService } from './drugs.service';
import { CreateDrugDto, UpdateDrugDto, DispenseDrugDto, DrugQueryDto, AdjustStockDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Drugs')
@Controller('drugs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Add a drug' })
  create(@Body() dto: CreateDrugDto) {
    return this.drugsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List drugs' })
  findAll(@Query() query: DrugQueryDto) {
    return this.drugsService.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock drugs' })
  getLowStock(@Query('clinicId') clinicId: string) {
    return this.drugsService.getLowStock(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drug by ID' })
  findOne(@Param('id') id: string) {
    return this.drugsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Update drug' })
  update(@Param('id') id: string, @Body() dto: UpdateDrugDto) {
    return this.drugsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete drug' })
  remove(@Param('id') id: string) {
    return this.drugsService.remove(id);
  }

  @Post('dispense')
  @Roles(UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Dispense drug to patient' })
  dispense(@Body() dto: DispenseDrugDto) {
    return this.drugsService.dispense(dto);
  }

  @Post(':id/deduct')
  @Roles(UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Deduct stock from drug' })
  deductStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.drugsService.deductStock(id, dto.quantity);
  }

  @Post(':id/restock')
  @Roles(UserRole.PHARMACIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Restock drug' })
  restock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.drugsService.restock(id, dto.quantity);
  }
}
