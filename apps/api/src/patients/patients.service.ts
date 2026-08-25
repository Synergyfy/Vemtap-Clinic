import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(dto);
    return this.patientRepository.save(patient);
  }

  async findAll(query: PatientQueryDto): Promise<{ data: Patient[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const where: any = {};

    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.patientType) where.patientType = query.patientType;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.firstName = Like(`%${query.search}%`);
    }

    const [data, total] = await this.patientRepository.findAndCount({
      where,
      relations: ['clinic', 'branch'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id }, relations: ['clinic', 'branch'] });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async getStats(clinicId: string) {
    const total = await this.patientRepository.count({ where: { clinicId } });
    const active = await this.patientRepository.count({ where: { clinicId, status: 'active' } });
    const hmo = await this.patientRepository.count({ where: { clinicId, patientType: 'hmo' } });
    const privatePatients = await this.patientRepository.count({ where: { clinicId, patientType: 'private' } });
    return { total, active, hmo, private: privatePatients };
  }

  async findByHMO(hmoName: string, clinicId: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { hmoName, clinicId, patientType: 'hmo' },
      relations: ['clinic', 'branch'],
    });
  }
}
