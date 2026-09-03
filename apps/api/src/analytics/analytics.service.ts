import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { Expense } from '../entities/expense.entity';
import { Appointment } from '../entities/appointment.entity';
import { QueueEntry } from '../entities/queue-entry.entity';
import { Staff } from '../entities/staff.entity';
import { Patient } from '../entities/patient.entity';
import { OpticalSale } from '../entities/optical-sale.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(QueueEntry) private queueRepo: Repository<QueueEntry>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(OpticalSale) private opticalSaleRepo: Repository<OpticalSale>,
  ) {}

  async getRevenueSummary(clinicId: string) {
    const invoices = await this.invoiceRepo.find({ where: { clinicId } });
    const payments = await this.paymentRepo.find({ where: { clinicId } });
    const expenses = await this.expenseRepo.find({ where: { clinicId } });

    const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const outstanding = invoices.reduce((sum, i) => sum + Number(i.balance), 0);

    // Monthly breakdown
    const monthlyRevenue: Record<string, number> = {};
    const monthlyExpenses: Record<string, number> = {};
    for (const p of payments) {
      const month = new Date(p.createdAt).toLocaleString('en-US', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(p.amount);
    }
    for (const e of expenses) {
      const month = new Date(e.date).toLocaleString('en-US', { month: 'short' });
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Number(e.amount);
    }

    return {
      totalRevenue,
      totalPaid,
      totalExpenses,
      outstanding,
      netProfit: totalPaid - totalExpenses,
      monthlyRevenue,
      monthlyExpenses,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      expenseCount: expenses.length,
    };
  }

  async getStaffKPIs(clinicId: string) {
    const staff = await this.staffRepo.find({ where: { clinicId } });
    const appointments = await this.appointmentRepo.find({ where: { clinicId } });

    return staff.map(s => {
      const staffAppointments = appointments.filter(a => a.staffId === s.id);
      const completed = staffAppointments.filter(a => a.status === 'completed');
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        role: s.role,
        totalAppointments: staffAppointments.length,
        completedAppointments: completed.length,
        completionRate: staffAppointments.length > 0
          ? Math.round((completed.length / staffAppointments.length) * 100)
          : 0,
      };
    });
  }

  async getQueueAnalytics(clinicId: string) {
    const entries = await this.queueRepo.find({ where: { clinicId } });
    const total = entries.length;
    const waiting = entries.filter(e => e.status === 'waiting').length;
    const inProgress = entries.filter(e => e.status === 'in_progress').length;
    const completed = entries.filter(e => e.status === 'completed').length;
    const cancelled = entries.filter(e => e.status === 'cancelled').length;

    // By station
    const byStation: Record<string, number> = {};
    for (const e of entries) {
      byStation[e.station] = (byStation[e.station] || 0) + 1;
    }

    return { total, waiting, inProgress, completed, cancelled, byStation };
  }

  async getAppointmentTrends(clinicId: string) {
    const appointments = await this.appointmentRepo.find({ where: { clinicId } });
    const monthly: Record<string, { booked: number; completed: number; missed: number }> = {};

    for (const a of appointments) {
      const month = new Date(a.appointmentDate).toLocaleString('en-US', { month: 'short' });
      if (!monthly[month]) monthly[month] = { booked: 0, completed: 0, missed: 0 };
      monthly[month].booked++;
      if (a.status === 'completed') monthly[month].completed++;
      if (a.status === 'no_show') monthly[month].missed++;
    }

    return monthly;
  }

  async getOpticalAnalytics(clinicId: string) {
    const sales = await this.opticalSaleRepo.find({ where: { clinicId } });
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const completed = sales.filter(s => s.status === 'completed').length;

    return { totalSales, totalRevenue, completed, conversionRate: totalSales > 0 ? Math.round((completed / totalSales) * 100) : 0 };
  }
}
