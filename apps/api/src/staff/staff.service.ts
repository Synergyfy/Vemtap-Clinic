import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Staff, StaffRole } from '../entities/staff.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const existing = await this.staffRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const staff = this.staffRepository.create(dto);
    const savedStaff = await this.staffRepository.save(staff);

    const existingAuthUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingAuthUser) {
      existingAuthUser.firstName = dto.firstName;
      existingAuthUser.lastName = dto.lastName;
      existingAuthUser.role = this.mapStaffRoleToUserRole(dto.role);
      existingAuthUser.clinicId = dto.clinicId;
      existingAuthUser.isActive = true;
      existingAuthUser.password = await bcrypt.hash(dto.password ?? 'password123', 10);
      await this.userRepository.save(existingAuthUser);
      return savedStaff;
    }

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: await bcrypt.hash(dto.password ?? 'password123', 10),
      role: this.mapStaffRoleToUserRole(dto.role),
      clinicId: dto.clinicId,
      isActive: true,
    });

    await this.userRepository.save(user);
    return savedStaff;
  }

  private mapStaffRoleToUserRole(role: StaffRole): UserRole {
    switch (role) {
      case StaffRole.ADMIN:
        return UserRole.ADMIN;
      case StaffRole.DOCTOR:
        return UserRole.DOCTOR;
      case StaffRole.NURSE:
        return UserRole.NURSE;
      case StaffRole.RECEPTIONIST:
        return UserRole.RECEPTIONIST;
      case StaffRole.PHARMACIST:
        return UserRole.PHARMACIST;
      case StaffRole.OPTOMETRIST:
        return UserRole.OPTOMETRIST;
      case StaffRole.CASHIER:
        return UserRole.CASHIER;
      case StaffRole.LAB_TECHNICIAN:
      default:
        return UserRole.RECEPTIONIST;
    }
  }

  async findAll(query: StaffQueryDto): Promise<{ data: Staff[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.role) where.role = query.role;
    if (query.department) where.department = query.department;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.firstName = Like(`%${query.search}%`);
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));

    const [data, total] = await this.staffRepository.findAndCount({
      where,
      relations: ['clinic', 'branch'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
