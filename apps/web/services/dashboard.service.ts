import { api } from '@/lib/api';

export interface DashboardOverview {
  patients: {
    total: number;
    newToday: number;
  };
  appointments: {
    today: number;
    completed: number;
  };
  queue: {
    waiting: number;
    inProgress: number;
  };
  revenue: {
    today: number;
    outstanding: number;
  };
  staff: {
    onDuty: number;
  };
  hmo: {
    pendingClaims: number;
  };
  pharmacy: {
    lowStock: number;
  };
}

export interface RevenueReportEntry {
  date: string;
  billed: number;
  collected: number;
  outstanding: number;
}

export interface AppointmentAnalytics {
  byStatus: Array<{ status: string; count: string }>;
  byType: Array<{ type: string; count: string }>;
}

export interface HMOAnalytics {
  byStatus: Array<{
    status: string;
    count: string;
    totalClaimed: string;
    totalApproved: string;
  }>;
}

export const dashboardService = {
  async getOverview(clinicId: string): Promise<DashboardOverview> {
    const response = await api.get(`/dashboard?clinicId=${clinicId}`);
    return response.data as DashboardOverview;
  },

  async getRevenue(clinicId: string, startDate: string, endDate: string): Promise<RevenueReportEntry[]> {
    const response = await api.get(`/dashboard/revenue?clinicId=${clinicId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data as RevenueReportEntry[];
  },

  async getAppointmentAnalytics(clinicId: string, startDate: string, endDate: string): Promise<AppointmentAnalytics> {
    const response = await api.get(`/dashboard/appointments?clinicId=${clinicId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data as AppointmentAnalytics;
  },

  async getHMOAnalytics(clinicId: string): Promise<HMOAnalytics> {
    const response = await api.get(`/dashboard/hmo?clinicId=${clinicId}`);
    return response.data as HMOAnalytics;
  },
};
