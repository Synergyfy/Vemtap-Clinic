import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { OpticalService } from './optical.service';
import { OpticalController } from './optical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpticalInventoryItem, LensOrder])],
  providers: [OpticalService],
  controllers: [OpticalController],
  exports: [OpticalService],
})
export class OpticalModule {}
