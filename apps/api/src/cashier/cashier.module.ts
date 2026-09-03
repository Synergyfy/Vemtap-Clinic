import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierShift } from '../entities/cashier-shift.entity';
import { Payment } from '../entities/payment.entity';
import { CashierTransaction } from '../entities/cashier-transaction.entity';
import { Product } from '../entities/product.entity';
import { CashierService } from './cashier.service';
import { CashierController } from './cashier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CashierShift, Payment, CashierTransaction, Product])],
  providers: [CashierService],
  controllers: [CashierController],
})
export class CashierModule {}
