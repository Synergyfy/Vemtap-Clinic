import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservationNote, ObservationCategory } from '../entities/observation-note.entity';
import { Staff } from '../entities/staff.entity';

@Injectable()
export class ObservationNotesService {
  constructor(
    @InjectRepository(ObservationNote) private noteRepo: Repository<ObservationNote>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
  ) {}

  async create(data: {
    note: string;
    category?: ObservationCategory;
    patientId: string;
    staffId?: string;
    staffEmail?: string;
    clinicId: string;
  }): Promise<ObservationNote> {
    let staffId = data.staffId;

    if (!staffId && data.staffEmail) {
      const matchingStaff = await this.staffRepo.findOne({
        where: { email: data.staffEmail },
        select: ['id'],
      });
      staffId = matchingStaff?.id;
    }

    const payload: Record<string, any> = { ...data };
    delete payload.staffEmail;

    if (staffId) {
      payload.staffId = staffId;
    } else {
      delete payload.staffId;
    }

    const note = this.noteRepo.create(payload);
    return this.noteRepo.save(note);
  }

  async findByPatient(patientId: string, limit = 50): Promise<ObservationNote[]> {
    return this.noteRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByClinic(clinicId: string, staffId?: string, limit = 50): Promise<ObservationNote[]> {
    const where: Record<string, string> = { clinicId };
    if (staffId) where.staffId = staffId;

    return this.noteRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
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