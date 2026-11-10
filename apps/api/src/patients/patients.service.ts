import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { HMOPlan } from '../entities/hmo-plan.entity';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(HMOPlan)
    private hmoPlanRepository: Repository<HMOPlan>,
  ) {}

  async create(dto: CreatePatientDto, currentUser?: { clinicId?: string | null; branchId?: string | null }): Promise<Patient> {
    const safeDto: any = { ...dto };
    const effectiveClinicId = currentUser?.clinicId ?? dto.clinicId;
    const effectiveBranchId = currentUser?.branchId ?? dto.branchId;

    if (effectiveClinicId) safeDto.clinicId = effectiveClinicId;
    else delete safeDto.clinicId;

    if (!effectiveBranchId || effectiveBranchId === effectiveClinicId || effectiveBranchId.trim() === '') {
      delete safeDto.branchId;
    } else {
      safeDto.branchId = effectiveBranchId.trim();
    }

    const patient = this.patientRepository.create(safeDto) as unknown as Patient;
    return this.patientRepository.save(patient);
  }

  async findAll(
    query: PatientQueryDto,
    currentUser?: { clinicId?: string | null },
  ): Promise<{ data: Patient[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const effectiveClinicId = currentUser?.clinicId ?? query.clinicId;
    const where: any = {};

    if (effectiveClinicId) where.clinicId = effectiveClinicId;
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

  async findOne(id: string, currentUser?: { clinicId?: string | null }): Promise<Patient> {
    const where: any = { id };
    if (currentUser?.clinicId) {
      where.clinicId = currentUser.clinicId;
    }

    const patient = await this.patientRepository.findOne({ where, relations: ['clinic', 'branch'] });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, currentUser?: { clinicId?: string | null }): Promise<Patient> {
    const patient = await this.findOne(id, currentUser);
    const safeDto = { ...dto } as any;
    safeDto.clinicId = currentUser?.clinicId ?? patient.clinicId ?? (dto as any).clinicId;
    Object.assign(patient, safeDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string, currentUser?: { clinicId?: string | null }): Promise<void> {
    const patient = await this.findOne(id, currentUser);
    await this.patientRepository.remove(patient);
  }

  async getStats(clinicId: string) {
    const effectiveClinicId = clinicId;
    const total = await this.patientRepository.count({ where: { clinicId: effectiveClinicId } });
    const active = await this.patientRepository.count({ where: { clinicId: effectiveClinicId, status: 'active' } });
    const hmo = await this.patientRepository.count({ where: { clinicId: effectiveClinicId, patientType: 'hmo' } });
    const privatePatients = await this.patientRepository.count({ where: { clinicId: effectiveClinicId, patientType: 'private' } });
    return { total, active, hmo, private: privatePatients };
  }

  async findByHMO(hmoName: string, clinicId: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { hmoName, clinicId, patientType: 'hmo' },
      relations: ['clinic', 'branch'],
    });
  }

  async checkHMOEligibility(
    patientId: string,
    serviceType: string,
    serviceAmount: number,
    currentUser?: { clinicId?: string | null },
  ): Promise<any> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, ...(currentUser?.clinicId ? { clinicId: currentUser.clinicId } : {}) },
      relations: ['hmo'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (!patient.hmoId || !patient.hmo) {
      return { eligible: false, reason: 'Patient is not registered with an HMO', patientName: `${patient.firstName} ${patient.lastName}` };
    }

    const plan = await this.hmoPlanRepository.findOne({
      where: { hmoId: patient.hmoId, isActive: true },
      order: { createdAt: 'DESC' },
    });
    if (!plan) {
      return { eligible: false, reason: 'No active plan found for patient HMO', patientName: `${patient.firstName} ${patient.lastName}` };
    }

    let coveragePercent = 0;
    let copay = 0;
    let allowance = 0;

    switch (serviceType) {
      case 'consultation':
        coveragePercent = Number(plan.consultationCoverage);
        copay = Number(plan.consultationCopay);
        break;
      case 'eye_test':
        coveragePercent = Number(plan.eyeTestCoverage);
        copay = Number(plan.eyeTestCopay);
        break;
      case 'optical':
        coveragePercent = Number(plan.opticalCoverage);
        copay = Number(plan.opticalCopay);
        allowance = Number(plan.opticalAllowance);
        break;
      case 'drug':
        coveragePercent = Number(plan.drugCoverage);
        copay = Number(plan.drugCopay);
        allowance = Number(plan.drugAllowance);
        break;
      case 'surgery':
        coveragePercent = Number(plan.surgeryCoverage);
        copay = Number(plan.surgeryCopay);
        break;
      default:
        return { eligible: false, reason: 'Unknown service type', patientName: `${patient.firstName} ${patient.lastName}` };
    }

    if (plan.excludedServices?.includes(serviceType)) {
      return {
        eligible: false,
        coveragePercent: 0,
        copayAmount: serviceAmount,
        hmoPays: 0,
        patientPays: serviceAmount,
        requiresAuthorization: false,
        remainingAllowance: 0,
        planName: plan.name,
        patientName: `${patient.firstName} ${patient.lastName}`,
        hmoName: patient.hmo?.name,
      };
    }

    const hmoPays = (serviceAmount * coveragePercent) / 100;
    const patientPays = serviceAmount - hmoPays + copay;

    return {
      eligible: coveragePercent > 0,
      coveragePercent,
      copayAmount: copay,
      hmoPays: Math.round(hmoPays * 100) / 100,
      patientPays: Math.round(patientPays * 100) / 100,
      requiresAuthorization: plan.requiresAuthorization,
      remainingAllowance: allowance,
      planName: plan.name,
      patientName: `${patient.firstName} ${patient.lastName}`,
      hmoName: patient.hmo?.name,
    };
  }
}
