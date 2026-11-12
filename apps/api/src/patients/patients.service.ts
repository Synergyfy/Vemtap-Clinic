import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { HMOPlan } from '../entities/hmo-plan.entity';
import { PatientClinicMembership } from '../entities/patient-clinic-membership.entity';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(HMOPlan)
    private hmoPlanRepository: Repository<HMOPlan>,
    @InjectRepository(PatientClinicMembership)
    private membershipRepository?: Repository<PatientClinicMembership>,
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

    // Emails are matched case-insensitively everywhere else (portal register and
    // login), so store the normalised form here too.
    if (safeDto.email) safeDto.email = String(safeDto.email).trim().toLowerCase();
    else delete safeDto.email;

    // A patient who created their own portal account before visiting the clinic
    // already has a row. Adopting that row (when it is not attached to a clinic)
    // keeps a single identity, so the clinic shows up on their portal dashboard.
    const existing = await this.findExistingIdentity(safeDto.email, safeDto.phone);
    if (existing?.portalAccessEnabled && (!existing.clinicId || existing.clinicId === safeDto.clinicId)) {
      if (!existing.clinicId && safeDto.clinicId) {
        existing.clinicId = safeDto.clinicId;
        existing.branchId = safeDto.branchId ?? null;
        await this.patientRepository.save(existing);
      }
      await this.ensureClinicMembership(existing.id, safeDto.clinicId, safeDto.branchId ?? null);
      return this.findOne(existing.id, { clinicId: safeDto.clinicId ?? null });
    }

    const patient = this.patientRepository.create(safeDto) as unknown as Patient;
    const saved = await this.patientRepository.save(patient);

    await this.ensureClinicMembership(saved.id, saved.clinicId, saved.branchId ?? null);

    // The clinic keeps its own clinical record, but the patient's existing portal
    // account must still see the clinic on their dashboard.
    if (existing?.portalAccessEnabled && existing.id !== saved.id) {
      await this.ensureClinicMembership(existing.id, saved.clinicId, saved.branchId ?? null);
    }

    return saved;
  }

  /**
   * Finds an existing patient row for the same person, preferring a portal
   * account. Phone numbers are compared on their last 10 digits because clinic
   * staff store local numbers (`0803...`) while the portal stores E.164 (`+803...`).
   */
  private async findExistingIdentity(email?: string | null, phone?: string | null): Promise<Patient | null> {
    if (!this.patientRepository?.findOne) return null;

    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    if (normalizedEmail) {
      const byEmail = await this.patientRepository.findOne({ where: { email: normalizedEmail } });
      // When staff captured an email, only that email is authoritative. Falling
      // back to the phone here could attach this clinic to a different person who
      // happens to share a (family) phone number.
      return byEmail ?? null;
    }

    const digits = String(phone ?? '').replace(/\D/g, '');
    if (digits.length < 10 || !this.patientRepository.createQueryBuilder) return null;

    return this.patientRepository
      .createQueryBuilder('p')
      .where("RIGHT(REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g'), 10) = :tail", { tail: digits.slice(-10) })
      .getOne();
  }

  private async ensureClinicMembership(
    patientId?: string | null,
    clinicId?: string | null,
    branchId?: string | null,
  ): Promise<void> {
    if (!this.membershipRepository || !patientId || !clinicId) return;

    const existing = await this.membershipRepository.findOne({ where: { patientId, clinicId } });
    if (existing) {
      if (branchId && existing.branchId !== branchId) {
        existing.branchId = branchId;
        await this.membershipRepository.save(existing);
      }
      return;
    }

    const count = await this.membershipRepository.count({ where: { patientId } });
    await this.membershipRepository.save(
      this.membershipRepository.create({
        patientId,
        clinicId,
        branchId: branchId ?? null,
        isPrimary: count === 0,
        isActive: true,
      }),
    );
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
