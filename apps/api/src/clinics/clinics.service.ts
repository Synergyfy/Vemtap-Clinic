import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Clinic } from '../entities/clinic.entity';
import { User } from '../entities/user.entity';
import { Invoice } from '../entities/invoice.entity';
import { HMOClaim, HMOClaimStatus } from '../entities/hmo-claim.entity';
import { CreateClinicDto, UpdateClinicDto, ClinicQueryDto } from './dto/clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private clinicRepo: Repository<Clinic>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(HMOClaim)
    private claimRepo: Repository<HMOClaim>,
  ) {}

  async create(dto: CreateClinicDto): Promise<Clinic> {
    const clinic = this.clinicRepo.create(dto);
    return this.clinicRepo.save(clinic);
  }

  async findAll(query: ClinicQueryDto): Promise<Clinic[]> {
    const qb = this.clinicRepo.createQueryBuilder('clinic');

    if (query.search) {
      qb.where(
        '(LOWER(clinic.name) LIKE :search OR LOWER(clinic.city) LIKE :search OR LOWER(clinic.state) LIKE :search OR LOWER(clinic.email) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.isActive !== undefined) {
      const activeBool = String(query.isActive) === 'true';
      if (query.search) {
        qb.andWhere('clinic.isActive = :isActive', { isActive: activeBool });
      } else {
        qb.where('clinic.isActive = :isActive', { isActive: activeBool });
      }
    }

    qb.orderBy('clinic.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepo.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException(`Clinic with ID ${id} not found`);
    return clinic;
  }

  async update(id: string, dto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id);
    Object.assign(clinic, dto);
    return this.clinicRepo.save(clinic);
  }

  async remove(id: string): Promise<void> {
    const clinic = await this.findOne(id);
    await this.clinicRepo.remove(clinic);
  }

  async getStats() {
    const total = await this.clinicRepo.count();
    const active = await this.clinicRepo.count({ where: { isActive: true } });
    return {
      total,
      active,
      inactive: total - active,
    };
  }

  async getPlatformOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClinics,
      activeClinics,
      totalUsers,
      recentClinics,
      monthlyRevenueRaw,
      totalInvoices,
      hmoInvoices,
      pendingClaims,
    ] = await Promise.all([
      this.clinicRepo.count(),
      this.clinicRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { isActive: true } }),
      this.clinicRepo.find({
        order: { createdAt: 'DESC' },
        take: 6,
      }),
      this.invoiceRepo
        .createQueryBuilder('i')
        .select('SUM(i.amountPaid)', 'sum')
        .where('i.createdAt >= :startOfMonth', { startOfMonth })
        .getRawOne(),
      this.invoiceRepo.count(),
      this.claimRepo.count(),
      this.claimRepo.count({ where: { status: HMOClaimStatus.SUBMITTED } }),
    ]);

    const monthlyRevenue = parseFloat(monthlyRevenueRaw?.sum || '0');
    const hmoUsagePercent = totalInvoices > 0 ? ((hmoInvoices / totalInvoices) * 100).toFixed(1) : '0.0';

    return {
      stats: {
        totalClinics,
        activeClinics,
        activeUsers: totalUsers,
        monthlyRevenue,
        hmoUsage: `${hmoUsagePercent}%`,
      },
      recentClinics: recentClinics.map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city || 'Lagos',
        email: c.email || 'contact@clinic.ng',
        phone: c.phone || '0800-000-0000',
        plan: 'Standard',
        status: c.isActive ? 'Active' : 'Pending',
        createdAt: c.createdAt,
      })),
      alerts: [
        ...(pendingClaims > 0
          ? [
              {
                id: 'alt-1',
                title: 'Pending HMO Claims',
                desc: `${pendingClaims} submitted claim(s) require insurer adjudication.`,
                time: 'Live',
                type: 'warning',
              },
            ]
          : []),
        {
          id: 'alt-2',
          title: 'Platform Gateway Active',
          desc: 'All regional branches and clinic instances running smoothly.',
          time: 'Normal',
          type: 'success',
        },
      ],
    };
  }
}
