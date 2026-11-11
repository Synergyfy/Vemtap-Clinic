import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpticalInventoryItem } from '../entities/optical-inventory-item.entity';
import { LensOrder } from '../entities/lens-order.entity';
import { OpticalProductionItem } from '../entities/optical-production-item.entity';
import { OpticalSale } from '../entities/optical-sale.entity';
import { OpticalService } from './optical.service';
import { OpticalController } from './optical.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpticalInventoryItem, LensOrder, OpticalProductionItem, OpticalSale]),
    NotificationsModule,
  ],
  providers: [OpticalService],
  controllers: [OpticalController],
  exports: [OpticalService],
})
export class OpticalModule {}
