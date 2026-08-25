import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HMO } from '../entities/hmo.entity';
import { HMOClaim } from '../entities/hmo-claim.entity';
import { HMOAppeal } from '../entities/hmo-appeal.entity';
import { HMORemittance } from '../entities/hmo-remittance.entity';
import { CreateHMODto, UpdateHMODto, CreateClaimDto, UpdateClaimDto, CreateAppealDto, UpdateAppealDto, CreateRemittanceDto, UpdateRemittanceDto, HMOQueryDto } from './dto';

@Injectable()
export class HmoService {
  constructor(
    @InjectRepository(HMO) private hmoRepository: Repository<HMO>,
    @InjectRepository(HMOClaim) private claimRepository: Repository<HMOClaim>,
    @InjectRepository(HMOAppeal) private appealRepository: Repository<HMOAppeal>,
    @InjectRepository(HMORemittance) private remittanceRepository: Repository<HMORemittance>,
  ) {}

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

  async getStats(clinicId: string) {
    const totalClaims = await this.claimRepository.count({ where: { clinicId } });
    const pendingClaims = await this.claimRepository.count({ where: { clinicId, status: 'submitted' as any } });
    const approvedClaims = await this.claimRepository.count({ where: { clinicId, status: 'approved' as any } });
    const totalRemittances = await this.remittanceRepository.count({ where: { clinicId } });
    return { totalClaims, pendingClaims, approvedClaims, totalRemittances };
  }
}
