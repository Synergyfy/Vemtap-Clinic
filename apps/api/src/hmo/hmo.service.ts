import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HMO } from '../entities/hmo.entity';
import { HMOPlan } from '../entities/hmo-plan.entity';
import { HMOAgreement } from '../entities/hmo-agreement.entity';
import { HMOAuthorization, AuthorizationStatus } from '../entities/hmo-authorization.entity';
import { HMOClaim } from '../entities/hmo-claim.entity';
import { HMOAppeal } from '../entities/hmo-appeal.entity';
import { HMORemittance } from '../entities/hmo-remittance.entity';
import {
  CreateHMODto, UpdateHMODto, CreateClaimDto, UpdateClaimDto,
  CreateAppealDto, UpdateAppealDto, CreateRemittanceDto, UpdateRemittanceDto,
  HMOQueryDto,   CreateHMOPlanDto, UpdateHMOPlanDto,
  CreateHMOAgreementDto, UpdateHMOAgreementDto, CoverageCheckDto,
  CreateAuthorizationDto, UpdateAuthorizationDto,
} from './dto';

@Injectable()
export class HmoService {
  constructor(
    @InjectRepository(HMO) private hmoRepository: Repository<HMO>,
    @InjectRepository(HMOPlan) private planRepository: Repository<HMOPlan>,
    @InjectRepository(HMOAgreement) private agreementRepository: Repository<HMOAgreement>,
    @InjectRepository(HMOAuthorization) private authRepository: Repository<HMOAuthorization>,
    @InjectRepository(HMOClaim) private claimRepository: Repository<HMOClaim>,
    @InjectRepository(HMOAppeal) private appealRepository: Repository<HMOAppeal>,
    @InjectRepository(HMORemittance) private remittanceRepository: Repository<HMORemittance>,
  ) {}

  // --- HMO CRUD ---
  async createHMO(dto: CreateHMODto): Promise<HMO> {
    const hmo = this.hmoRepository.create(dto);
    return this.hmoRepository.save(hmo);
  }

  async findAllHMOs(query: HMOQueryDto): Promise<HMO[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.hmoRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOneHMO(id: string): Promise<HMO> {
    const hmo = await this.hmoRepository.findOne({ where: { id } });
    if (!hmo) throw new NotFoundException('HMO not found');
    return hmo;
  }

  async updateHMO(id: string, dto: UpdateHMODto): Promise<HMO> {
    const hmo = await this.findOneHMO(id);
    Object.assign(hmo, dto);
    return this.hmoRepository.save(hmo);
  }

  // --- HMO Plans ---
  async createPlan(dto: CreateHMOPlanDto): Promise<HMOPlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async findAllPlans(hmoId: string): Promise<HMOPlan[]> {
    return this.planRepository.find({ where: { hmoId }, order: { createdAt: 'DESC' } });
  }

  async findOnePlan(id: string): Promise<HMOPlan> {
    const plan = await this.planRepository.findOne({ where: { id }, relations: ['hmo'] });
    if (!plan) throw new NotFoundException('HMO plan not found');
    return plan;
  }

  async updatePlan(id: string, dto: UpdateHMOPlanDto): Promise<HMOPlan> {
    const plan = await this.findOnePlan(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async removePlan(id: string): Promise<void> {
    const plan = await this.findOnePlan(id);
    await this.planRepository.remove(plan);
  }

  // --- Coverage Check ---
  async checkCoverage(dto: CoverageCheckDto): Promise<any> {
    const plan = await this.planRepository.findOne({ where: { hmoId: dto.hmoId, isActive: true } });
    if (!plan) throw new NotFoundException('No active plan found for this HMO');

    let coveragePercent = 0;
    let copay = 0;
    let allowance = 0;

    switch (dto.serviceType) {
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
    }

    if (plan.excludedServices?.includes(dto.serviceType)) {
      return {
        covered: false, coveragePercent: 0, copayAmount: dto.serviceAmount,
        hmoPays: 0, patientPays: dto.serviceAmount, requiresAuthorization: false,
        remainingAllowance: 0, planName: plan.name,
      };
    }

    const hmoPays = (dto.serviceAmount * coveragePercent) / 100;
    const patientPays = dto.serviceAmount - hmoPays + copay;

    return {
      covered: coveragePercent > 0,
      coveragePercent,
      copayAmount: copay,
      hmoPays: Math.round(hmoPays * 100) / 100,
      patientPays: Math.round(patientPays * 100) / 100,
      requiresAuthorization: plan.requiresAuthorization,
      remainingAllowance: allowance,
      planName: plan.name,
    };
  }

  // --- HMO Agreements ---
  async createAgreement(dto: CreateHMOAgreementDto): Promise<HMOAgreement> {
    const agreement = this.agreementRepository.create(dto);
    return this.agreementRepository.save(agreement);
  }

  async findAllAgreements(hmoId: string, clinicId?: string): Promise<HMOAgreement[]> {
    const where: any = { hmoId };
    if (clinicId) where.clinicId = clinicId;
    return this.agreementRepository.find({ where, relations: ['hmo', 'clinic'], order: { createdAt: 'DESC' } });
  }

  async findOneAgreement(id: string): Promise<HMOAgreement> {
    const agreement = await this.agreementRepository.findOne({ where: { id }, relations: ['hmo', 'clinic'] });
    if (!agreement) throw new NotFoundException('HMO agreement not found');
    return agreement;
  }

  async updateAgreement(id: string, dto: UpdateHMOAgreementDto): Promise<HMOAgreement> {
    const agreement = await this.findOneAgreement(id);
    Object.assign(agreement, dto);
    return this.agreementRepository.save(agreement);
  }

  // --- Claims ---
  async createClaim(dto: CreateClaimDto): Promise<HMOClaim> {
    const claim = this.claimRepository.create({ ...dto, submittedDate: new Date() });
    return this.claimRepository.save(claim);
  }

  async findAllClaims(clinicId?: string): Promise<HMOClaim[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.claimRepository.find({ where, relations: ['hmo', 'patient'], order: { createdAt: 'DESC' } });
  }

  async updateClaim(id: string, dto: UpdateClaimDto): Promise<HMOClaim> {
    const claim = await this.claimRepository.findOne({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    Object.assign(claim, dto);
    if (dto.status) claim.reviewedDate = new Date();
    return this.claimRepository.save(claim);
  }

  // --- Appeals ---
  async createAppeal(dto: CreateAppealDto): Promise<HMOAppeal> {
    const appeal = this.appealRepository.create(dto);
    return this.appealRepository.save(appeal);
  }

  async updateAppeal(id: string, dto: UpdateAppealDto): Promise<HMOAppeal> {
    const appeal = await this.appealRepository.findOne({ where: { id } });
    if (!appeal) throw new NotFoundException('Appeal not found');
    Object.assign(appeal, dto);
    if (dto.status) appeal.resolvedDate = new Date();
    return this.appealRepository.save(appeal);
  }

  // --- Remittances ---
  async createRemittance(dto: CreateRemittanceDto): Promise<HMORemittance> {
    const remittance = this.remittanceRepository.create(dto);
    return this.remittanceRepository.save(remittance);
  }

  async findAllRemittances(clinicId?: string): Promise<HMORemittance[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.remittanceRepository.find({ where, relations: ['hmo'], order: { createdAt: 'DESC' } });
  }

  async updateRemittance(id: string, dto: UpdateRemittanceDto): Promise<HMORemittance> {
    const remittance = await this.remittanceRepository.findOne({ where: { id } });
    if (!remittance) throw new NotFoundException('Remittance not found');
    Object.assign(remittance, dto);
    return this.remittanceRepository.save(remittance);
  }

  // --- Authorizations ---
  async createAuthorization(dto: CreateAuthorizationDto): Promise<HMOAuthorization> {
    const auth = this.authRepository.create({
      ...dto,
      serviceType: dto.serviceType as any,
      status: AuthorizationStatus.PENDING,
    });
    return this.authRepository.save(auth);
  }

  async findAllAuthorizations(clinicId?: string): Promise<HMOAuthorization[]> {
    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    return this.authRepository.find({ where, relations: ['patient', 'hmo', 'plan', 'requestedBy', 'approvedBy'], order: { createdAt: 'DESC' } });
  }

  async findOneAuthorization(id: string): Promise<HMOAuthorization> {
    const auth = await this.authRepository.findOne({ where: { id }, relations: ['patient', 'hmo', 'plan', 'requestedBy', 'approvedBy', 'clinic'] });
    if (!auth) throw new NotFoundException('Authorization not found');
    return auth;
  }

  async updateAuthorization(id: string, dto: UpdateAuthorizationDto): Promise<HMOAuthorization> {
    const auth = await this.findOneAuthorization(id);
    Object.assign(auth, dto);
    if (dto.status === 'approved') auth.approvedDate = new Date();
    return this.authRepository.save(auth);
  }

  async getPendingAuthorizations(clinicId: string): Promise<HMOAuthorization[]> {
    return this.authRepository.find({
      where: { clinicId, status: AuthorizationStatus.PENDING },
      relations: ['patient', 'hmo'],
      order: { createdAt: 'ASC' },
    });
  }

  // --- Stats ---
  async getStats(clinicId: string) {
    const totalClaims = await this.claimRepository.count({ where: { clinicId } });
    const pendingClaims = await this.claimRepository.count({ where: { clinicId, status: 'submitted' as any } });
    const approvedClaims = await this.claimRepository.count({ where: { clinicId, status: 'approved' as any } });
    const totalRemittances = await this.remittanceRepository.count({ where: { clinicId } });
    const totalHMOs = await this.hmoRepository.count({ where: { clinicId } });
    const totalPlans = await this.planRepository.count();
    return { totalHMOs, totalPlans, totalClaims, pendingClaims, approvedClaims, totalRemittances };
  }
}
