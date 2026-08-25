import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { QueueEntry, QueueStatus } from '../entities/queue-entry.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Staff } from '../entities/staff.entity';
import { HMOClaim, HMOClaimStatus } from '../entities/hmo-claim.entity';
import { Drug } from '../entities/drug.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(QueueEntry) private queueRepo: Repository<QueueEntry>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(HMOClaim) private claimRepo: Repository<HMOClaim>,
    @InjectRepository(Drug) private drugRepo: Repository<Drug>,
  ) {}

  async getClinicDashboard(clinicId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      newPatientsToday,
      todayAppointments,
      completedAppointments,
      queueWaiting,
      queueInProgress,
      todayRevenue,
      outstandingBalance,
      staffOnDuty,
      pendingClaims,
      lowStockDrugs,
    ] = await Promise.all([
      this.patientRepo.count({ where: { clinicId } }),
      this.patientRepo.count({ where: { clinicId, status: 'new' as any } }),
      this.appointmentRepo.count({ where: { clinicId, appointmentDate: Between(today, tomorrow) as any } }),
      this.appointmentRepo.count({ where: { clinicId, appointmentDate: Between(today, tomorrow) as any, status: AppointmentStatus.COMPLETED } }),
      this.queueRepo.count({ where: { clinicId, status: QueueStatus.WAITING } }),
      this.queueRepo.count({ where: { clinicId, status: QueueStatus.IN_PROGRESS } }),
      this.invoiceRepo.createQueryBuilder('i')
        .select('SUM(i.amountPaid)', 'sum')
        .where('i.clinicId = :clinicId', { clinicId })
        .andWhere('i.createdAt >= :today', { today })
        .getRawOne()
        .then(r => parseFloat(r?.sum || '0')),
      this.invoiceRepo.createQueryBuilder('i')
        .select('SUM(i.balance)', 'sum')
        .where('i.clinicId = :clinicId', { clinicId })
        .getRawOne()
        .then(r => parseFloat(r?.sum || '0')),
      this.staffRepo.count({ where: { clinicId, isActive: true } }),
      this.claimRepo.count({ where: { clinicId, status: HMOClaimStatus.SUBMITTED } }),
      this.drugRepo.createQueryBuilder('d')
        .where('d.clinicId = :clinicId', { clinicId })
        .andWhere('d.quantityInStock <= d.reorderLevel')
        .getCount(),
    ]);

    return {
      patients: { total: totalPatients, newToday: newPatientsToday },
      appointments: { today: todayAppointments, completed: completedAppointments },
      queue: { waiting: queueWaiting, inProgress: queueInProgress },
      revenue: { today: todayRevenue, outstanding: outstandingBalance },
      staff: { onDuty: staffOnDuty },
      hmo: { pendingClaims },
      pharmacy: { lowStock: lowStockDrugs },
    };
  }

  async getRevenueReport(clinicId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.invoiceRepo.createQueryBuilder('i')
      .select("DATE_TRUNC('day', i.createdAt)", 'date')
      .addSelect('SUM(i.totalAmount)', 'billed')
      .addSelect('SUM(i.amountPaid)', 'collected')
      .addSelect('SUM(i.balance)', 'outstanding')
      .where('i.clinicId = :clinicId', { clinicId })
      .andWhere('i.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy("DATE_TRUNC('day', i.createdAt)")
      .orderBy("DATE_TRUNC('day', i.createdAt)", 'ASC')
      .getRawMany();

    return result.map(r => ({
      date: r.date,
      billed: parseFloat(r.billed),
      collected: parseFloat(r.collected),
      outstanding: parseFloat(r.outstanding),
    }));
  }

  async getAppointmentAnalytics(clinicId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const byStatus = await this.appointmentRepo.createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.clinicId = :clinicId', { clinicId })
      .andWhere('a.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('a.status')
      .getRawMany();

    const byType = await this.appointmentRepo.createQueryBuilder('a')
      .select('a.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('a.clinicId = :clinicId', { clinicId })
      .andWhere('a.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('a.type')
      .getRawMany();

    return { byStatus, byType };
  }

  async getHMOAnalytics(clinicId: string) {
    const byStatus = await this.claimRepo.createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(c.amountClaimed)', 'totalClaimed')
      .addSelect('SUM(c.amountApproved)', 'totalApproved')
      .where('c.clinicId = :clinicId', { clinicId })
      .groupBy('c.status')
      .getRawMany();

    return { byStatus };
  }
}
