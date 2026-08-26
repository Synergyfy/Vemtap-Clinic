import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, In } from 'typeorm';
import { Debtor, DebtorType, DebtorStatus } from '../entities/debtor.entity';
import { PaymentPlan, PaymentPlanStatus } from '../entities/payment-plan.entity';
import { PaymentPlanInstallment, InstallmentStatus } from '../entities/payment-plan-installment.entity';
import { CollectionActivity, CollectionActivityType, CollectionOutcome } from '../entities/collection-activity.entity';
import { Patient } from '../entities/patient.entity';
import { HMO } from '../entities/hmo.entity';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Staff } from '../entities/staff.entity';
import { Clinic } from '../entities/clinic.entity';
import {
  CreateDebtorDto, UpdateDebtorDto, DebtorQueryDto, AgingReportDto,
  CreatePaymentPlanDto, UpdatePaymentPlanDto, PaymentPlanQueryDto,
  CreateCollectionActivityDto, UpdateCollectionActivityDto, CollectionActivityQueryDto,
} from './dto';

@Injectable()
export class DebtorsService {
  constructor(
    @InjectRepository(Debtor) private debtorRepo: Repository<Debtor>,
    @InjectRepository(PaymentPlan) private planRepo: Repository<PaymentPlan>,
    @InjectRepository(PaymentPlanInstallment) private installmentRepo: Repository<PaymentPlanInstallment>,
    @InjectRepository(CollectionActivity) private activityRepo: Repository<CollectionActivity>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(HMO) private hmoRepo: Repository<HMO>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Clinic) private clinicRepo: Repository<Clinic>,
  ) {}

  // ========== Debtors ==========
  async createDebtor(dto: CreateDebtorDto, clinicId: string): Promise<Debtor> {
    // Validate patient or HMO exists
    if (dto.type === 'patient' && dto.patientId) {
      const patient = await this.patientRepo.findOne({ where: { id: dto.patientId, clinicId } });
      if (!patient) throw new BadRequestException('Patient not found');
    }
    if (dto.type === 'hmo' && dto.hmoId) {
      const hmo = await this.hmoRepo.findOne({ where: { id: dto.hmoId } });
      if (!hmo) throw new BadRequestException('HMO not found');
    }

    const count = await this.debtorRepo.count({ where: { clinicId } });
    const debtor = this.debtorRepo.create({
      ...dto,
      debtorNumber: `DBT-${String(count + 1).padStart(4, '0')}`,
      clinicId,
      totalOutstanding: dto.totalOutstanding || 0,
      currentBalance: dto.totalOutstanding || 0,
    });
    return this.debtorRepo.save(debtor);
  }

  async findDebtors(query: DebtorQueryDto): Promise<Debtor[]> {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.patientId) where.patientId = query.patientId;
    if (query.hmoId) where.hmoId = query.hmoId;
    if (query.assignedCollectorId) where.assignedCollectorId = query.assignedCollectorId;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.debtorRepo.find({ where, relations: ['patient', 'hmo', 'assignedCollector'], order: { createdAt: 'DESC' } });
  }

  async findDebtorById(id: string): Promise<Debtor> {
    const debtor = await this.debtorRepo.findOne({ where: { id }, relations: ['patient', 'hmo', 'assignedCollector', 'paymentPlans', 'collectionActivities'] });
    if (!debtor) throw new NotFoundException('Debtor not found');
    return debtor;
  }

  async updateDebtor(id: string, dto: UpdateDebtorDto): Promise<Debtor> {
    const debtor = await this.findDebtorById(id);
    Object.assign(debtor, dto);
    return this.debtorRepo.save(debtor);
  }

  async deleteDebtor(id: string): Promise<void> {
    const debtor = await this.findDebtorById(id);
    if (debtor.currentBalance > 0) {
      throw new BadRequestException('Cannot delete debtor with outstanding balance');
    }
    await this.debtorRepo.remove(debtor);
  }

  // ========== Aging & Recalculation ==========
  async recalculateDebtorBalances(clinicId: string, asOfDate?: Date): Promise<{ updated: number }> {
    const date = asOfDate || new Date();
    const debtors = await this.debtorRepo.find({ where: { clinicId } });
    let updated = 0;

    for (const debtor of debtors) {
      const invoices = await this.invoiceRepo.find({
        where: {
          clinicId,
          ...(debtor.type === 'patient' ? { patientId: debtor.patientId } : { hmoId: debtor.hmoId }),
          status: In(['pending', 'partial', 'overdue']),
        },
      });

      let totalOutstanding = 0;
      let overdue30 = 0, overdue60 = 0, overdue90 = 0, overdue120Plus = 0;

      for (const inv of invoices) {
        const payments = await this.paymentRepo.find({ where: { invoiceId: inv.id } });
        const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = Number(inv.totalAmount) - paid;

        if (balance > 0) {
          totalOutstanding += balance;
          const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          if (daysOverdue > 120) overdue120Plus += balance;
          else if (daysOverdue > 90) overdue90 += balance;
          else if (daysOverdue > 60) overdue60 += balance;
          else if (daysOverdue > 30) overdue30 += balance;
        }
      }

      debtor.totalOutstanding = totalOutstanding;
      debtor.currentBalance = totalOutstanding;
      debtor.overdue30 = overdue30;
      debtor.overdue60 = overdue60;
      debtor.overdue90 = overdue90;
      debtor.overdue120Plus = overdue120Plus;
      debtor.status = totalOutstanding > 0 ? DebtorStatus.ACTIVE : DebtorStatus.SETTLED;

      await this.debtorRepo.save(debtor);
      updated++;
    }

    return { updated };
  }

  async getAgingReport(query: AgingReportDto): Promise<any[]> {
    const date = query.asOfDate ? new Date(query.asOfDate) : new Date();
    const debtors = await this.debtorRepo.find({ where: { clinicId: query.clinicId } });

    return debtors.map(d => ({
      debtorNumber: d.debtorNumber,
      name: d.type === 'patient' ? `${d.patient?.firstName} ${d.patient?.lastName}` : d.hmo?.name,
      type: d.type,
      totalOutstanding: d.totalOutstanding,
      current: d.currentBalance - d.overdue30 - d.overdue60 - d.overdue90 - d.overdue120Plus,
      overdue30: d.overdue30,
      overdue60: d.overdue60,
      overdue90: d.overdue90,
      overdue120Plus: d.overdue120Plus,
      status: d.status,
      lastPaymentDate: d.lastPaymentDate,
      assignedCollector: d.assignedCollector ? `${d.assignedCollector.firstName} ${d.assignedCollector.lastName}` : null,
    }));
  }

  // ========== Payment Plans ==========
  async createPaymentPlan(dto: CreatePaymentPlanDto, clinicId: string): Promise<any> {
    const debtor = await this.debtorRepo.findOne({ where: { id: dto.debtorId, clinicId } });
    if (!debtor) throw new NotFoundException('Debtor not found');

    if (dto.totalAmount > debtor.currentBalance) {
      throw new BadRequestException('Payment plan amount cannot exceed current balance');
    }

    const count = await this.planRepo.count({ where: { clinicId } });

    const plan = this.planRepo.create({
      ...dto,
      planNumber: `PLN-${String(count + 1).padStart(4, '0')}`,
      clinicId,
      amountRemaining: dto.totalAmount,
      status: PaymentPlanStatus.ACTIVE,
    });
    const saved = await this.planRepo.save(plan);

    // Create installments
    const installmentAmount = Number(dto.totalAmount) / dto.totalInstallments;
    const startDate = new Date(dto.startDate);
    const installmentEntities: any[] = [];
    for (let i = 1; i <= dto.totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i - 1);
      installmentEntities.push(this.installmentRepo.create({
        paymentPlanId: saved.id,
        installmentNumber: i,
        amountDue: installmentAmount,
        dueDate,
        clinicId: saved.clinicId,
      }));
    }
    await this.installmentRepo.save(installmentEntities);

    debtor.status = DebtorStatus.ON_PLAN;
    await this.debtorRepo.save(debtor);

    return { ...saved, installments: installmentEntities };
  }

  async findPaymentPlans(query: PaymentPlanQueryDto): Promise<PaymentPlan[]> {
    const where: any = {};
    if (query.debtorId) where.debtorId = query.debtorId;
    if (query.status) where.status = query.status;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.planRepo.find({ where, relations: ['debtor', 'approvedBy'], order: { createdAt: 'DESC' } });
  }

  async findPaymentPlanById(id: string): Promise<PaymentPlan> {
    const plan = await this.planRepo.findOne({ where: { id }, relations: ['debtor', 'approvedBy', 'installments'] });
    if (!plan) throw new NotFoundException('Payment plan not found');
    return plan;
  }

  async updatePaymentPlan(id: string, dto: UpdatePaymentPlanDto): Promise<PaymentPlan> {
    const plan = await this.findPaymentPlanById(id);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  // ========== Collection Activities ==========
  async createCollectionActivity(dto: CreateCollectionActivityDto, clinicId: string, performedById: string): Promise<CollectionActivity> {
    const debtor = await this.debtorRepo.findOne({ where: { id: dto.debtorId, clinicId } });
    if (!debtor) throw new NotFoundException('Debtor not found');

    const activity = this.activityRepo.create({
      ...dto,
      clinicId,
      performedById,
    });
    const saved = await this.activityRepo.save(activity);

    // Update debtor's next follow-up date
    if (dto.nextActionDate) {
      const debtorUpdate = await this.debtorRepo.findOne({ where: { id: dto.debtorId } });
      if (debtorUpdate) {
        debtorUpdate.nextFollowUpDate = new Date(dto.nextActionDate);
        await this.debtorRepo.save(debtorUpdate);
      }
    }

    return saved;
  }

  async findCollectionActivities(query: CollectionActivityQueryDto): Promise<CollectionActivity[]> {
    const where: any = {};
    if (query.debtorId) where.debtorId = query.debtorId;
    if (query.activityType) where.activityType = query.activityType;
    if (query.outcome) where.outcome = query.outcome;
    if (query.performedById) where.performedById = query.performedById;
    if (query.clinicId) where.clinicId = query.clinicId;
    return this.activityRepo.find({ where, relations: ['debtor', 'performedBy'], order: { createdAt: 'DESC' } });
  }

  async updateCollectionActivity(id: string, dto: UpdateCollectionActivityDto): Promise<CollectionActivity> {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException('Collection activity not found');
    Object.assign(activity, dto);
    return this.activityRepo.save(activity);
  }

  // ========== Stats ==========
  async getStats(clinicId: string): Promise<{
    totalDebtors: number;
    totalOutstanding: number;
    byStatus: Record<string, number>;
    aging: { current: number; overdue30: number; overdue60: number; overdue90: number; overdue120Plus: number };
    paymentPlans: { active: number; completed: number; defaulted: number };
  }> {
    const debtors = await this.debtorRepo.find({ where: { clinicId } });
    const plans = await this.planRepo.find({ where: { clinicId } });

    const byStatus: Record<string, number> = {};
    let totalOutstanding = 0;
    let current = 0, overdue30 = 0, overdue60 = 0, overdue90 = 0, overdue120Plus = 0;

    for (const d of debtors) {
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
      totalOutstanding += d.totalOutstanding;
      current += d.currentBalance - d.overdue30 - d.overdue60 - d.overdue90 - d.overdue120Plus;
      overdue30 += d.overdue30;
      overdue60 += d.overdue60;
      overdue90 += d.overdue90;
      overdue120Plus += d.overdue120Plus;
    }

    const planStats = { active: 0, completed: 0, defaulted: 0 };
    for (const p of plans) {
      if (p.status === 'active') planStats.active++;
      else if (p.status === 'completed') planStats.completed++;
      else if (p.status === 'defaulted') planStats.defaulted++;
    }

    return {
      totalDebtors: debtors.length,
      totalOutstanding,
      byStatus,
      aging: { current, overdue30, overdue60, overdue90, overdue120Plus },
      paymentPlans: planStats,
    };
  }
}