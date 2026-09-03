import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequest } from '../entities/return-request.entity';
import { Refund } from '../entities/refund.entity';
import { Product } from '../entities/product.entity';
import { Drug } from '../entities/drug.entity';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnRequest, Refund, Product, Drug, OpticalInventoryItem])],
  providers: [ReturnsService],
  controllers: [ReturnsController],
  exports: [ReturnsService],
})
export class ReturnsModule {}