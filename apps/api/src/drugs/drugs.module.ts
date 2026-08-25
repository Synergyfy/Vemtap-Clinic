import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from '../entities/drug.entity';
import { DispensingRecord } from '../entities/dispensing-record.entity';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Drug, DispensingRecord])],
  providers: [DrugsService],
  controllers: [DrugsController],
  exports: [DrugsService],
})
export class DrugsModule {}
