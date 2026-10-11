import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Clinic } from '../entities/clinic.entity';
import { Branch } from '../entities/branch.entity';
import { Staff, StaffRole } from '../entities/staff.entity';

@Injectable()
export class DevSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Clinic) private clinicRepo: Repository<Clinic>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      await this.seed();
    }
  }

  async seed() {
    console.log('🌱 [DEV SEED] Starting database seed...');

    const clinic = await this.ensureClinic();
    const branch = await this.ensureBranch(clinic);

    await this.ensureUsers(clinic, branch);
    await this.ensureStaff(clinic, branch);

    console.log('✅ [DEV SEED] Database seed completed!');
  }

  private async ensureClinic(): Promise<Clinic> {
    let clinic = await this.clinicRepo.findOne({ where: { name: 'Vemtap Health Clinic' } });
    if (!clinic) {
      clinic = this.clinicRepo.create({
        name: 'Vemtap Health Clinic',
        address: '123 Medical Drive',
        city: 'Lagos',
        state: 'Lagos',
        phone: '+234-800-123-4567',
        email: 'info@vemtapclinic.com',
        isActive: true,
      });
      clinic = await this.clinicRepo.save(clinic);
      console.log('🏥 Created clinic:', clinic.name);
    }
    return clinic;
  }

  private async ensureBranch(clinic: Clinic): Promise<Branch> {
    let branch = await this.branchRepo.findOne({ where: { name: 'Main Branch', clinicId: clinic.id } });
    if (!branch) {
      branch = this.branchRepo.create({
        name: 'Main Branch',
        address: '123 Medical Drive',
        city: 'Lagos',
        state: 'Lagos',
        phone: '+234-800-123-4567',
        email: 'main@vemtapclinic.com',
        isActive: true,
        clinicId: clinic.id,
      });
      branch = await this.branchRepo.save(branch);
      console.log('🏢 Created branch:', branch.name);
    }
    return branch;
  }

  private async ensureUsers(clinic: Clinic, branch: Branch) {
    const passwordHash = await bcrypt.hash('password123', 10);

    const testUsers = [
      { email: 'admin@vemtap.com', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN, clinicId: clinic.id },
      { email: 'doctor@vemtap.com', firstName: 'Dr. Sarah', lastName: 'Johnson', role: UserRole.DOCTOR, clinicId: clinic.id },
      { email: 'nurse@vemtap.com', firstName: 'Mary', lastName: 'Williams', role: UserRole.NURSE, clinicId: clinic.id },
      { email: 'reception@vemtap.com', firstName: 'Jennifer', lastName: 'Davis', role: UserRole.RECEPTIONIST, clinicId: clinic.id },
      { email: 'pharmacist@vemtap.com', firstName: 'James', lastName: 'Wilson', role: UserRole.PHARMACIST, clinicId: clinic.id },
      { email: 'optometrist@vemtap.com', firstName: 'Dr. Lisa', lastName: 'Anderson', role: UserRole.OPTOMETRIST, clinicId: clinic.id },
      { email: 'cashier@vemtap.com', firstName: 'Michael', lastName: 'Brown', role: UserRole.CASHIER, clinicId: clinic.id },
    ];

    for (const u of testUsers) {
      let user = await this.userRepo.findOne({ where: { email: u.email } });
      if (!user) {
        user = this.userRepo.create({
          ...u,
          password: passwordHash,
          isActive: true,
        });
        user = await this.userRepo.save(user);
        console.log(`👤 Created user: ${u.email} (${u.role})`);
      }
    }
  }

  private async ensureStaff(clinic: Clinic, branch: Branch) {
    const staffData = [
      { email: 'doctor@vemtap.com', role: StaffRole.DOCTOR, department: 'Ophthalmology', specialization: 'Ophthalmologist' },
      { email: 'nurse@vemtap.com', role: StaffRole.NURSE, department: 'Nursing', specialization: 'Registered Nurse' },
      { email: 'reception@vemtap.com', role: StaffRole.RECEPTIONIST, department: 'Front Desk', specialization: 'Patient Coordinator' },
      { email: 'pharmacist@vemtap.com', role: StaffRole.PHARMACIST, department: 'Pharmacy', specialization: 'Clinical Pharmacist' },
      { email: 'optometrist@vemtap.com', role: StaffRole.OPTOMETRIST, department: 'Optometry', specialization: 'Optometrist' },
      { email: 'cashier@vemtap.com', role: StaffRole.CASHIER, department: 'Billing', specialization: 'Cashier' },
    ];

    for (const s of staffData) {
      const user = await this.userRepo.findOne({ where: { email: s.email } });
      if (!user) continue;

      const existing = await this.staffRepo.findOne({ where: { email: s.email } });
      if (!existing) {
        const staff = this.staffRepo.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: '+234-800-000-0000',
          role: s.role,
          department: s.department,
          specialization: s.specialization,
          clinicId: clinic.id,
          branchId: branch.id,
          isActive: true,
        });
        await this.staffRepo.save(staff);
        console.log(`👨‍⚕️ Created staff: ${s.email} (${s.role})`);
      }
    }
  }
}