import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationNote } from '../entities/observation-note.entity';
import { Staff } from '../entities/staff.entity';
import { ObservationNotesService } from './observation-notes.service';
import { ObservationNotesController } from './observation-notes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ObservationNote, Staff])],
  providers: [ObservationNotesService],
  controllers: [ObservationNotesController],
  exports: [ObservationNotesService],
})
export class ObservationNotesModule {}