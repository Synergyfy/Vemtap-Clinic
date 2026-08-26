import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurgicalProcedure } from '../entities/surgical-procedure.entity';
import { OperatingRoom } from '../entities/operating-room.entity';
import { SurgerySchedule } from '../entities/surgery-schedule.entity';
import { SurgeryService } from './surgery.service';
import { SurgeryController } from './surgery.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SurgicalProcedure, OperatingRoom, SurgerySchedule])],
  providers: [SurgeryService],
  controllers: [SurgeryController],
  exports: [SurgeryService],
})
export class SurgeryModule {}