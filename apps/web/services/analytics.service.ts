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
  [month: string]: {
    booked: number;
    completed: number;
    missed: number;
  };
}

export interface OpticalAnalytics {
  totalSales: number;
  totalRevenue: number;
  completed: number;
  conversionRate: number;
}

/**
 * GET /api/analytics/revenue?clinicId={clinicId}
 * Fetches total revenue, paid amount, expenses, outstanding invoices, and monthly breakdowns.
 */
export async function getRevenueSummary(clinicId: string): Promise<RevenueSummary> {
  const { data } = await api.get("/analytics/revenue", {
    params: { clinicId },
  });
  return data as RevenueSummary;
}

/**
 * GET /api/analytics/staff-kpis?clinicId={clinicId}
 * Fetches staff appointment completion statistics and performance KPIs.
 */
export async function getStaffKPIs(clinicId: string): Promise<StaffKPI[]> {
  const { data } = await api.get("/analytics/staff-kpis", {
    params: { clinicId },
  });
  return data as StaffKPI[];
}

/**
 * GET /api/analytics/queue-analytics?clinicId={clinicId}
 * Fetches waiting, in-progress, completed queue counts and distribution across stations.
 */
export async function getQueueAnalytics(clinicId: string): Promise<QueueAnalytics> {
  const { data } = await api.get("/analytics/queue-analytics", {
    params: { clinicId },
  });
  return data as QueueAnalytics;
}

/**
 * GET /api/analytics/appointment-trends?clinicId={clinicId}
 * Fetches monthly trends for booked, completed, and missed appointments.
 */
export async function getAppointmentTrends(clinicId: string): Promise<AppointmentTrends> {
  const { data } = await api.get("/analytics/appointment-trends", {
    params: { clinicId },
  });
  return data as AppointmentTrends;
}

/**
 * GET /api/analytics/optical?clinicId={clinicId}
 * Fetches optical orders count, revenue, completed orders, and conversion rate.
 */
export async function getOpticalAnalytics(clinicId: string): Promise<OpticalAnalytics> {
  const { data } = await api.get("/analytics/optical", {
    params: { clinicId },
  });
  return data as OpticalAnalytics;
}

