import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryTransfersService } from './inventory-transfers.service';
import {
  CreateTransferRequestDto, UpdateTransferRequestDto, TransferRequestQueryDto,
  ApproveTransferDto, ShipTransferDto, ReceiveTransferDto, CancelTransferDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Inventory Transfers')
@Controller('inventory-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryTransfersController {
  constructor(private readonly inventoryTransfersService: InventoryTransfersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create transfer request' })
  createTransfer(@Body() dto: CreateTransferRequestDto, @CurrentUser() user: any, @Query('clinicId') clinicId: string) {
    return this.inventoryTransfersService.createTransferRequest(dto, clinicId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List transfer requests' })
  findTransfers(@Query() query: TransferRequestQueryDto) {
    return this.inventoryTransfersService.findTransfers(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transfer statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.inventoryTransfersService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer request by ID' })
  findTransfer(@Param('id') id: string) {
    return this.inventoryTransfersService.findTransferById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.CASHIER)
  @ApiOperation({ summary: 'Update transfer request (only DRAFT/REQUESTED)' })
  updateTransfer(@Param('id') id: string, @Body() dto: UpdateTransferRequestDto) {
    return this.inventoryTransfersService.updateTransfer(id, dto);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Approve transfer request' })
  approveTransfer(@Param('id') id: string, @Body() dto: ApproveTransferDto, @CurrentUser() user: any) {
    return this.inventoryTransfersService.approveTransfer(id, dto, user.sub);
  }

  @Put(':id/ship')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.NURSE)
  @ApiOperation({ summary: 'Ship transfer (update shipped quantities)' })
  shipTransfer(@Param('id') id: string, @Body() dto: ShipTransferDto, @CurrentUser() user: any) {
    return this.inventoryTransfersService.shipTransfer(id, dto, user.sub);
  }

  @Put(':id/receive')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.NURSE)
  @ApiOperation({ summary: 'Receive transfer at destination branch' })
  receiveTransfer(@Param('id') id: string, @Body() dto: ReceiveTransferDto, @CurrentUser() user: any) {
    return this.inventoryTransfersService.receiveTransfer(id, dto, user.sub);
  }

  @Put(':id/cancel')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel transfer' })
  cancelTransfer(@Param('id') id: string, @Body() dto: CancelTransferDto, @CurrentUser() user: any) {
    return this.inventoryTransfersService.cancelTransfer(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transfer (only DRAFT/CANCELLED/REJECTED)' })
  deleteTransfer(@Param('id') id: string) {
    return this.inventoryTransfersService.deleteTransfer(id);
  }
}