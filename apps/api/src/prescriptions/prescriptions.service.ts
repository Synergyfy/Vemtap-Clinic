import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionRepository.create(dto);
    return this.prescriptionRepository.save(prescription);
  }

  async findAll(medicalRecordId?: string): Promise<Prescription[]> {
    const where: any = {};
    if (medicalRecordId) where.medicalRecordId = medicalRecordId;
    return this.prescriptionRepository.find({ where, relations: ['medicalRecord', 'prescribedBy'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({ where: { id }, relations: ['medicalRecord', 'prescribedBy'] });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async update(id: string, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    Object.assign(prescription, dto);
    return this.prescriptionRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository
      .createQueryBuilder('p')
      .innerJoin('p.medicalRecord', 'mr')
      .where('mr.patientId = :patientId', { patientId })
      .leftJoinAndSelect('p.prescribedBy', 'staff')
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }
}
