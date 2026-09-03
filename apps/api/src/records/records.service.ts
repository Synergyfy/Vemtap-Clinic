import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Vitals } from '../entities/vitals.entity';
import { EyeTest } from '../entities/eye-test.entity';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, MedicalRecordQueryDto } from './dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private recordRepository: Repository<MedicalRecord>,
    @InjectRepository(Vitals)
    private vitalsRepository: Repository<Vitals>,
    @InjectRepository(EyeTest)
    private eyeTestRepository: Repository<EyeTest>,
  ) {}

  async create(dto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const { vitals, eyeTest, ...recordData } = dto;
    const record = this.recordRepository.create(recordData);
    const saved = await this.recordRepository.save(record);

    if (vitals) {
      const v = this.vitalsRepository.create({ ...vitals, medicalRecordId: saved.id });
      await this.vitalsRepository.save(v);
    }
    if (eyeTest) {
      const e = this.eyeTestRepository.create({ ...eyeTest, medicalRecordId: saved.id });
      await this.eyeTestRepository.save(e);
    }

    return this.findOne(saved.id);
  }

  async findAll(query: MedicalRecordQueryDto): Promise<MedicalRecord[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.staffId) where.staffId = query.staffId;
    if (query.branchId) where.branchId = query.branchId;

    return this.recordRepository.find({
      where,
      relations: ['patient', 'staff', 'branch', 'vitals', 'eyeTests'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['patient', 'staff', 'branch', 'clinic', 'vitals', 'eyeTests', 'prescriptions'],
    });
    if (!record) throw new NotFoundException('Medical record not found');
    return record;
  }

  async update(id: string, dto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Medical record not found');
    Object.assign(record, dto);
    await this.recordRepository.save(record);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.recordRepository.remove(record);
  }

  async getPatientHistory(patientId: string): Promise<MedicalRecord[]> {
    return this.recordRepository.find({
      where: { patientId },
      relations: ['staff', 'vitals', 'eyeTests', 'prescriptions'],
      order: { createdAt: 'DESC' },
    });
  }
}
