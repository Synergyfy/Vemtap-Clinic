import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, IsNull, Not, In } from 'typeorm';
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

  private generateClinicQrCode(clinicId: string): string {
    const normalizedId = String(clinicId || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
    return `VEM-${normalizedId || 'CLINIC'}`.slice(0, 20);
  }

  resolveClinicQrCodeValue(
    clinic?: (Partial<Clinic> & { qrCode?: string | null; qrUrl?: string | null }) | null,
  ): string {
    const savedQrCode = clinic?.qrCode?.trim();
    if (savedQrCode) return savedQrCode;

    const normalizedId = String(clinic?.id ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase();
    return normalizedId ? `VEM-${normalizedId}`.slice(0, 20) : '';
  }

  private buildClinicQrUrl(qrCode: string): string {
    if (!qrCode) return '';
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/reception/check-in?clinic=${encodeURIComponent(qrCode)}`;
  }

  isDemoClinic(clinic: Partial<Clinic>): boolean {
    const name = (clinic.name ?? '').trim().toLowerCase();
    const email = (clinic.email ?? '').trim().toLowerCase();

    return name === 'local test clinic' || email === 'clinic@example.com';
  }

  private filterVisibleClinics(clinics: Clinic[]): Clinic[] {
    return clinics.filter((clinic) => !this.isDemoClinic(clinic));
  }

  async create(dto: CreateClinicDto, ownerId?: string | null): Promise<Clinic> {
    const clinic = this.clinicRepo.create({
      ...dto,
      ownerId: ownerId ?? null,
    });

    const savedClinic = await this.clinicRepo.save(clinic);
    const qrCode = this.resolveClinicQrCodeValue(savedClinic);
    const qrUrl = this.buildClinicQrUrl(qrCode);

    const withQrCode = await this.clinicRepo.save({
      ...savedClinic,
      qrCode,
      qrUrl,
    });

    if (ownerId) {
      await this.userRepo.update({ id: ownerId }, { clinicId: withQrCode.id });
    }

    return withQrCode;
  }

  async findByQrCode(qrCode: string): Promise<Clinic> {
    const normalizedQrCode = (qrCode ?? '').trim();
    if (!normalizedQrCode || normalizedQrCode === 'VEM-CLINIC') {
      throw new NotFoundException(`Clinic QR code ${qrCode} not found`);
    }

    const clinic = await this.clinicRepo.findOne({ where: { qrCode: normalizedQrCode } });
    if (!clinic) throw new NotFoundException(`Clinic QR code ${normalizedQrCode} not found`);
    return clinic;
  }

  async findAll(
    query: ClinicQueryDto,
    currentUser?: { userId?: string; clinicId?: string | null; roles?: string[] },
  ): Promise<Clinic[]> {
    const qb = this.clinicRepo.createQueryBuilder('clinic');

    if (currentUser?.clinicId) {
      qb.where('clinic.id = :clinicId', { clinicId: currentUser.clinicId });
    } else if (currentUser?.userId) {
      qb.where('clinic.ownerId = :ownerId', { ownerId: currentUser.userId });
    }

    if (query.search) {
      const searchPredicate =
        '(LOWER(clinic.name) LIKE :search OR LOWER(clinic.city) LIKE :search OR LOWER(clinic.state) LIKE :search OR LOWER(clinic.email) LIKE :search)';

      if (currentUser?.userId || currentUser?.clinicId) {
        qb.andWhere(searchPredicate, { search: `%${query.search.toLowerCase()}%` });
      } else {
        qb.where(searchPredicate, { search: `%${query.search.toLowerCase()}%` });
      }
    }

    if (query.isActive !== undefined) {
      const activeBool = String(query.isActive) === 'true';
      if (query.search || currentUser?.userId || currentUser?.clinicId) {
        qb.andWhere('clinic.isActive = :isActive', { isActive: activeBool });
      } else {
        qb.where('clinic.isActive = :isActive', { isActive: activeBool });
      }
    }

    qb.orderBy('clinic.createdAt', 'DESC');
    return this.filterVisibleClinics(await qb.getMany());
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

  async getStats(currentUser?: { userId?: string; clinicId?: string | null; roles?: string[] }) {
    const clinicScope = currentUser?.clinicId
      ? { id: currentUser.clinicId }
      : currentUser?.userId
        ? { ownerId: currentUser.userId }
        : undefined;

    const clinics = this.filterVisibleClinics(
      await this.clinicRepo.find({
        where: clinicScope,
        order: { createdAt: 'DESC' },
      }),
    );
    const total = clinics.length;
    const active = clinics.filter((clinic) => clinic.isActive).length;
    return {
      total,
      active,
      inactive: total - active,
    };
  }

  async getPlatformOverview(currentUser?: { userId?: string; clinicId?: string | null; roles?: string[] }) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const clinicScope = currentUser?.clinicId
      ? { id: currentUser.clinicId }
      : currentUser?.userId
        ? { ownerId: currentUser.userId }
        : undefined;

    const allClinics = await this.clinicRepo.find({
      where: clinicScope,
      order: { createdAt: 'DESC' },
    });
    const visibleClinics = this.filterVisibleClinics(allClinics);
    const visibleClinicIds = visibleClinics.map((clinic) => clinic.id);

    const [totalUsers, monthlyRevenueRaw, totalInvoices, hmoInvoices, pendingClaims] = await Promise.all([
      (async () => {
        if (currentUser?.clinicId) {
          return this.userRepo.count({ where: { isActive: true, clinicId: currentUser.clinicId } });
        }

        if (currentUser?.userId) {
          if (!visibleClinicIds.length) return 0;
          return this.userRepo.count({ where: { isActive: true, clinicId: In(visibleClinicIds) } });
        }

        return this.userRepo.count({
          where: {
            isActive: true,
            clinicId: Not(IsNull()),
          },
        });
      })(),
      this.invoiceRepo
        .createQueryBuilder('i')
        .select('SUM(i.amountPaid)', 'sum')
        .where('i.createdAt >= :startOfMonth', { startOfMonth })
        .getRawOne(),
      this.invoiceRepo.count(),
      this.claimRepo.count(),
      this.claimRepo.count({ where: { status: HMOClaimStatus.SUBMITTED } }),
    ]);

    const totalClinics = visibleClinics.length;
    const activeClinics = visibleClinics.filter((clinic) => clinic.isActive).length;
    const recentClinics = visibleClinics.slice(0, 6);
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
        plan: c.plan || 'free',
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
