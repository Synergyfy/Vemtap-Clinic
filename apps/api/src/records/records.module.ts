import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Vitals } from '../entities/vitals.entity';
import { EyeTest } from '../entities/eye-test.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Vitals, EyeTest])],
  providers: [RecordsService],
  controllers: [RecordsController],
  exports: [RecordsService],
})
export class RecordsModule {}
