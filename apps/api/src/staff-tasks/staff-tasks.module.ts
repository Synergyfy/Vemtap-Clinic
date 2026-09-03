import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffTask } from '../entities/staff-task.entity';
import { StaffTasksService } from './staff-tasks.service';
import { StaffTasksController } from './staff-tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffTask])],
  providers: [StaffTasksService],
  controllers: [StaffTasksController],
})
export class StaffTasksModule {}
