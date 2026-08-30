import { api } from "@/lib/api";

export interface RevenueSummary {
  totalRevenue: number;
  totalPaid: number;
  totalExpenses: number;
  outstanding: number;
  netProfit: number;
  monthlyRevenue: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  invoiceCount: number;
  paymentCount: number;
  expenseCount: number;
}

export interface StaffKPI {
  id: string;
  name: string;
  role: string;
  totalAppointments: number;
  completedAppointments: number;
  completionRate: number;
}

export interface QueueAnalytics {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byStation: Record<string, number>;
}

export interface AppointmentTrends {
  [month: string]: { booked: number; completed: number; missed: number };
}

export interface OpticalAnalytics {
  totalSales: number;
  totalRevenue: number;
  completed: number;
  conversionRate: number;
}

export async function getRevenueSummary(clinicId: string): Promise<RevenueSummary> {
  const { data } = await api.get("/analytics/revenue", { params: { clinicId } });
  return data;
}

export async function getStaffKPIs(clinicId: string): Promise<StaffKPI[]> {
  const { data } = await api.get("/analytics/staff-kpis", { params: { clinicId } });
  return data;
}

export async function getQueueAnalytics(clinicId: string): Promise<QueueAnalytics> {
  const { data } = await api.get("/analytics/queue-analytics", { params: { clinicId } });
  return data;
}

export async function getAppointmentTrends(clinicId: string): Promise<AppointmentTrends> {
  const { data } = await api.get("/analytics/appointment-trends", { params: { clinicId } });
  return data;
}

export async function getOpticalAnalytics(clinicId: string): Promise<OpticalAnalytics> {
  const { data } = await api.get("/analytics/optical", { params: { clinicId } });
  return data;
}
