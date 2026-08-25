import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, SupplierQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List suppliers' })
  findAllSuppliers(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAllSuppliers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOneSupplier(@Param('id') id: string) {
    return this.suppliersService.findOneSupplier(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update supplier' })
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete supplier' })
  removeSupplier(@Param('id') id: string) {
    return this.suppliersService.removeSupplier(id);
  }

  @Post('orders')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create purchase order' })
  createOrder(@Body() dto: CreatePurchaseOrderDto) {
    return this.suppliersService.createOrder(dto);
  }

  @Get('orders/all')
  @ApiOperation({ summary: 'List purchase orders' })
  findAllOrders(@Query('clinicId') clinicId: string) {
    return this.suppliersService.findAllOrders(clinicId);
  }

  @Put('orders/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update purchase order' })
  updateOrder(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.suppliersService.updateOrder(id, dto);
  }
}
