import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservationNote, ObservationCategory } from '../entities/observation-note.entity';

@Injectable()
export class ObservationNotesService {
  constructor(
    @InjectRepository(ObservationNote) private noteRepo: Repository<ObservationNote>,
  ) {}

  async create(data: {
    note: string;
    category?: ObservationCategory;
    patientId: string;
    staffId?: string;
    clinicId: string;
  }): Promise<ObservationNote> {
    const note = this.noteRepo.create(data);
    return this.noteRepo.save(note);
  }

  async findByPatient(patientId: string): Promise<ObservationNote[]> {
    return this.noteRepo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async findByClinic(clinicId: string): Promise<ObservationNote[]> {
    return this.noteRepo.find({ where: { clinicId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<ObservationNote> {
    const note = await this.noteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Observation note not found');
    return note;
  }

  async remove(id: string): Promise<void> {
    await this.noteRepo.delete(id);
  }
}