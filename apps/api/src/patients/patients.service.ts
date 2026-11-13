import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
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

    // Staff can register a patient as a member of an existing family account.
    // The selected guardian must be a real, independent patient in this clinic.
    const guardianId = safeDto.guardianId ? String(safeDto.guardianId).trim() : '';
    if (guardianId) {
      const guardian = await this.patientRepository.findOne({ where: { id: guardianId } });
      if (!guardian) {
        throw new BadRequestException('The selected guardian account was not found.');
      }
      if (guardian.guardianId) {
        throw new BadRequestException(
          'That account is a dependent itself. Select the family account owner instead.',
        );
      }
      if (guardian.clinicId && safeDto.clinicId && guardian.clinicId !== safeDto.clinicId) {
        throw new ForbiddenException('That guardian belongs to another clinic.');
      }
      safeDto.guardianId = guardian.id;
      safeDto.guardianRelationship = safeDto.guardianRelationship ?? 'other';
    } else {
      delete safeDto.guardianId;
      delete safeDto.guardianRelationship;
    }

    // accountType is a portal-only field. Some clients still send it on patient
    // creation, so accept it instead of failing the whole request — but never
    // write it to the patients table. "guardian" is the one value with meaning:
    // it marks a row that owns a family (portal accounts use the same column).
    if (!guardianId && safeDto.accountType === 'guardian') {
      safeDto.guardianRelationship = 'guardian';
    }
    delete safeDto.accountType;

    // A patient who created their own portal account before visiting the clinic
    // already has a row — and so does a family member the guardian added, even
    // though their own login is not active yet. Reusing that row keeps a single
    // identity (and stops the front desk creating a duplicate child).
    const existing = await this.findExistingIdentity(safeDto.email, safeDto.phone);
    if (existing && safeDto.email) {
      // An email is a single identity: if it already belongs to a patient, the
      // name on the form has to be that person. Otherwise staff would silently
      // attach the wrong clinic record (or a typo) to someone's account.
      const existingName = this.displayName(existing);
      if (existingName && !this.namesCorrespond(existing, safeDto)) {
        throw new ConflictException(
          `This email already belongs to ${existingName}. The name you entered does not correspond to that account — please use the registered name or search for the existing patient.`,
        );
      }
    }
    const canReuseExisting = existing && (!existing.clinicId || existing.clinicId === safeDto.clinicId);
    if (canReuseExisting) {
      let shouldSave = false;

      if (!existing.clinicId && safeDto.clinicId) {
        existing.clinicId = safeDto.clinicId;
        existing.branchId = safeDto.branchId ?? null;
        shouldSave = true;
      }

      // Staff may attach an existing portal-only person (created at home) to a
      // family account. Never link the guardian to themselves.
      if (safeDto.guardianId && !existing.guardianId && safeDto.guardianId !== existing.id) {
        existing.guardianId = safeDto.guardianId;
        existing.guardianRelationship = safeDto.guardianRelationship ?? existing.guardianRelationship ?? 'other';
        shouldSave = true;
      }

      if (shouldSave) await this.patientRepository.save(existing);

      await this.ensureClinicMembership(existing.id, safeDto.clinicId, safeDto.branchId ?? null);
      // Dependents were created at home, before the guardian reached this clinic,
      // so they carry no clinic and stay invisible to staff. Adopt them too.
      await this.attachDependentsToClinic(existing.id, safeDto.clinicId, safeDto.branchId ?? null);
      return this.findOne(existing.id, { clinicId: safeDto.clinicId ?? null });
    }

    const patient = this.patientRepository.create(safeDto) as unknown as Patient;
    const saved = await this.patientRepository.save(patient);

    await this.ensureClinicMembership(saved.id, saved.clinicId, saved.branchId ?? null);

    // The clinic keeps its own clinical record, but the patient's existing portal
    // account (and their family) must still see the clinic on their dashboard.
    if (existing && existing.id !== saved.id) {
      await this.ensureClinicMembership(existing.id, saved.clinicId, saved.branchId ?? null);
      await this.attachDependentsToClinic(existing.id, saved.clinicId, saved.branchId ?? null);
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

  private displayName(patient: Pick<Patient, 'firstName' | 'lastName'>): string {
    return [patient.firstName, patient.lastName]
      .filter((part): part is string => Boolean(part && part.trim()))
      .map((part) => part.trim())
      .join(' ');
  }

  private normalizeNameTokens(...parts: Array<string | null | undefined>): Set<string> {
    return new Set(
      parts
        .filter((part): part is string => typeof part === 'string')
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean),
    );
  }

  /**
   * A name "corresponds" when the significant tokens are the same, ignoring
   * order, case, accents and extra middle names. Anything else — a different
   * first name, a misspelled surname — is treated as a mismatch, because the
   * email already identifies a specific person.
   */
  private namesCorrespond(
    existing: Pick<Patient, 'firstName' | 'lastName'>,
    dto: Pick<CreatePatientDto, 'firstName' | 'lastName'>,
  ): boolean {
    const existingTokens = this.normalizeNameTokens(existing.firstName, existing.lastName);
    const enteredTokens = this.normalizeNameTokens(dto.firstName, dto.lastName);

    if (existingTokens.size === 0 || enteredTokens.size === 0) return true;

    const enteredIsSubset = [...enteredTokens].every((token) => existingTokens.has(token));
    const existingIsSubset = [...existingTokens].every((token) => enteredTokens.has(token));

    return enteredIsSubset || existingIsSubset;
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

  /**
   * Dependents inherit their guardian's clinic at the moment they are added, but
   * a guardian who used the portal before their first visit has no clinic then —
   * so the dependent was created clinic-less and never appears in the staff
   * registry. When the guardian is finally attached to a clinic, bring the
   * dependents along without moving ones that already belong to another clinic.
   */
  private async attachDependentsToClinic(
    guardianId?: string | null,
    clinicId?: string | null,
    branchId?: string | null,
  ): Promise<void> {
    if (!guardianId || !clinicId || typeof this.patientRepository?.find !== 'function') return;

    const dependents = await this.patientRepository.find({ where: { guardianId } });

    for (const dependent of dependents) {
      if (dependent.clinicId && dependent.clinicId !== clinicId) continue;

      if (!dependent.clinicId) {
        dependent.clinicId = clinicId;
        if (!dependent.branchId) dependent.branchId = branchId ?? null;
        await this.patientRepository.save(dependent);
      }

      await this.ensureClinicMembership(dependent.id, clinicId, dependent.branchId ?? branchId ?? null);
    }
  }

  /**
   * Adds the read-only family fields the staff UI needs to a page of patients:
   * the guardian's name for a dependent, and how many profiles a guardian has.
   * These are computed, not persisted, so the list stays one row per patient.
   */
  private async decorateFamily(patients: Patient[]): Promise<Patient[]> {
    if (!patients.length || typeof this.patientRepository?.find !== 'function') return patients;

    const guardianIds = Array.from(
      new Set(patients.map((patient) => patient.guardianId).filter((id): id is string => Boolean(id))),
    );
    const patientIds = patients.map((patient) => patient.id);

    const [guardians, dependents] = await Promise.all([
      guardianIds.length
        ? this.patientRepository.find({ where: { id: In(guardianIds) } })
        : Promise.resolve([] as Patient[]),
      this.patientRepository.find({ where: { guardianId: In(patientIds) } }).catch(() => [] as Patient[]),
    ]);

    const guardianById = new Map(guardians.map((guardian) => [guardian.id, guardian]));
    const dependentCounts = new Map<string, number>();
    for (const dependent of dependents) {
      if (!dependent.guardianId) continue;
      dependentCounts.set(dependent.guardianId, (dependentCounts.get(dependent.guardianId) ?? 0) + 1);
    }

    for (const patient of patients) {
      const guardian = patient.guardianId ? guardianById.get(patient.guardianId) : undefined;
      (patient as any).guardianName = guardian ? this.displayName(guardian) : null;
      (patient as any).dependentCount = dependentCounts.get(patient.id) ?? 0;
    }

    return patients;
  }

  private async decorateFamilyDetail(patient: Patient): Promise<Patient> {
    if (typeof this.patientRepository?.find !== 'function') return patient;

    const [decorated] = await this.decorateFamily([patient]);

    if (typeof this.patientRepository?.find === 'function') {
      const dependents = await this.patientRepository.find({ where: { guardianId: patient.id } });
      (decorated as any).dependents = dependents.map((dependent) => ({
        id: dependent.id,
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        guardianRelationship: dependent.guardianRelationship ?? null,
        portalAccessEnabled: dependent.portalAccessEnabled,
        status: dependent.status,
      }));
    }

    return decorated;
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

    await this.decorateFamily(data);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, currentUser?: { clinicId?: string | null }): Promise<Patient> {
    const where: any = { id };
    if (currentUser?.clinicId) {
      where.clinicId = currentUser.clinicId;
    }

    const patient = await this.patientRepository.findOne({ where, relations: ['clinic', 'branch'] });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.decorateFamilyDetail(patient);
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
