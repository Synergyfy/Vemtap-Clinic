import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const existing = await this.staffRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const staff = this.staffRepository.create(dto);
    return this.staffRepository.save(staff);
  }

  async findAll(query: StaffQueryDto): Promise<Staff[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.role) where.role = query.role;
    if (query.department) where.department = query.department;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.firstName = Like(`%${query.search}%`);
    }

    return this.staffRepository.find({ where, relations: ['clinic', 'branch'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['clinic', 'branch'] });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    Object.assign(staff, dto);
    return this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async getStats(clinicId: string) {
    const total = await this.staffRepository.count({ where: { clinicId } });
    const active = await this.staffRepository.count({ where: { clinicId, isActive: true } });
    return { total, active, inactive: total - active };
  }
}
