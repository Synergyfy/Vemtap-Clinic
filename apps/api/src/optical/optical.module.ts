import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { OpticalProductionItem } from '../entities/optical-production-item.entity';
import { OpticalSale } from '../entities/optical-sale.entity';
import { OpticalService } from './optical.service';
import { OpticalController } from './optical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpticalInventoryItem, LensOrder, OpticalProductionItem, OpticalSale])],
  providers: [OpticalService],
  controllers: [OpticalController],
  exports: [OpticalService],
})
export class OpticalModule {}
