import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDocument } from '../entities/patient-document.entity';

@Injectable()
export class PatientDocumentsService {
  constructor(@InjectRepository(PatientDocument) private docRepo: Repository<PatientDocument>) {}

  async create(data: Partial<PatientDocument>): Promise<PatientDocument> {
    const doc = this.docRepo.create(data);
    return this.docRepo.save(doc);
  }

  async findByPatient(patientId: string): Promise<PatientDocument[]> {
    return this.docRepo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async remove(id: string): Promise<void> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.docRepo.delete(id);
  }
}
