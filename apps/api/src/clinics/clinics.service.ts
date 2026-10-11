import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Clinic } from '../entities/clinic.entity';
import { CreateClinicDto, UpdateClinicDto, ClinicQueryDto } from './dto';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
  ) {}

  async create(dto: CreateClinicDto): Promise<Clinic> {
    const clinic = this.clinicRepository.create(dto);
    return this.clinicRepository.save(clinic);
  }

  async findAll(query: ClinicQueryDto): Promise<Clinic[]> {
    const where: any = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.plan) where.plan = query.plan;
    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }
    return this.clinicRepository.find({ 
      where, 
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async update(id: string, dto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id);
    Object.assign(clinic, dto);
    return this.clinicRepository.save(clinic);
  }

  async remove(id: string): Promise<void> {
    const clinic = await this.findOne(id);
    await this.clinicRepository.remove(clinic);
  }

  async getStats() {
    const total = await this.clinicRepository.count();
    const active = await this.clinicRepository.count({ where: { isActive: true } });
    const byPlan = await this.clinicRepository
      .createQueryBuilder('clinic')
      .select('clinic.plan', 'plan')
      .addSelect('COUNT(*)', 'count')
      .groupBy('clinic.plan')
      .getRawMany();
    return { total, active, inactive: total - active, byPlan };
  }

  async getClinicWithStats(id: string) {
    const clinic = await this.findOne(id);
    return clinic;
  }
}