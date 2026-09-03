import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto, BranchQueryDto } from './dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create(dto);
    return this.branchRepository.save(branch);
  }

  async findAll(query: BranchQueryDto): Promise<Branch[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    return this.branchRepository.find({ where, relations: ['clinic'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id }, relations: ['clinic'] });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  async getStats(clinicId: string) {
    const total = await this.branchRepository.count({ where: { clinicId } });
    const active = await this.branchRepository.count({ where: { clinicId, isActive: true } });
    return { total, active, inactive: total - active };
  }
}
