import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyConfig } from '../entities/currency-config.entity';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyConfig])],
  providers: [CurrencyService],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {}