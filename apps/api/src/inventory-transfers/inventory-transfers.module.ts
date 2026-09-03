import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferRequest } from '../entities/transfer-request.entity';
import { TransferItem } from '../entities/transfer-item.entity';
import { Branch } from '../entities/branch.entity';
import { Product } from '../entities/product.entity';
import { Drug } from '../entities/drug.entity';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { InventoryTransfersService } from './inventory-transfers.service';
import { InventoryTransfersController } from './inventory-transfers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransferRequest, TransferItem, Branch, Product, Drug, OpticalInventoryItem])],
  providers: [InventoryTransfersService],
  controllers: [InventoryTransfersController],
  exports: [InventoryTransfersService],
})
export class InventoryTransfersModule {}