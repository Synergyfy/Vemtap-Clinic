import { api } from '@/lib/api';

export type QueueStatus = 
  | 'waiting'
  | 'called'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type QueueType = 
  | 'consultation'
  | 'eye_test'
  | 'optical'
  | 'lens_pickup'
  | 'pharmacy'
  | 'emergency';

export type Priority = 
  | 'Normal'
  | 'High'
  | 'Emergency';

export type PatientType = 
  | 'Private'
  | 'HMO';

export interface QueueEntry {
  id: string;
  ticketNumber: number;
  status: QueueStatus;
  station?: string;
  priority: string;
  notes?: string;
  calledAt?: string;
  completedAt?: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    patientType: string;
    hmoName?: string;
  };
  branchId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedQueueResponse {
  data: QueueEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueueQueryParams {
  clinicId?: string;
  branchId?: string;
  status?: QueueStatus;
  station?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateQueueEntryData {
  patientId: string;
  branchId: string;
  clinicId: string;
  station?: string;
  stage?: string;
  serviceType?: string;
  priority?: string;
  notes?: string;
  patientName?: string;
}

export interface UpdateQueueEntryData {
  status?: QueueStatus;
  station?: string;
  stage?: string;
  notes?: string;
}

export interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  avgWaitTime: number;
  byStation: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface QueueAnnouncement {
  id: string;
  message: string;
  type: string;
  targetQueueType?: string;
  clinicId: string;
  staffId?: string;
  createdAt: string;
}

export interface CreateAnnouncementData {
  message: string;
  type?: string;
  targetQueueType?: string;
  clinicId: string;
  staffId?: string;
}

export interface CallNextResponse {
  entry: QueueEntry | null;
  message: string;
}

export interface ResetQueueData {
  clinicId: string;
}

export const queueService = {
  async getAll(params: QueueQueryParams = {}): Promise<PaginatedQueueResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get(`/queue?${searchParams.toString()}`);
    return response.data as PaginatedQueueResponse;
  },

  async getById(id: string): Promise<QueueEntry> {
    const response = await api.get(`/queue/${id}`);
    return response.data as QueueEntry;
  },

  async create(data: CreateQueueEntryData): Promise<QueueEntry> {
    const response = await api.post('/queue', data);
    return response.data as QueueEntry;
  },

  async update(id: string, data: UpdateQueueEntryData): Promise<QueueEntry> {
    const response = await api.put(`/queue/${id}`, data);
    return response.data as QueueEntry;
  },

  async complete(id: string): Promise<QueueEntry> {
    const response = await api.put(`/queue/${id}/complete`);
    return response.data as QueueEntry;
  },

  async cancel(id: string): Promise<QueueEntry> {
    const response = await api.put(`/queue/${id}/cancel`);
    return response.data as QueueEntry;
  },

  async callNext(clinicId: string, branchId: string): Promise<CallNextResponse> {
    const response = await api.get(`/queue/next?clinicId=${clinicId}&branchId=${branchId}`);
    return response.data as CallNextResponse;
  },

  async getStats(clinicId: string): Promise<QueueStats> {
    const response = await api.get(`/queue/stats?clinicId=${clinicId}`);
    return response.data as QueueStats;
  },

  async getAnnouncements(clinicId: string): Promise<QueueAnnouncement[]> {
    const response = await api.get(`/queue/announcements?clinicId=${clinicId}`);
    return response.data as QueueAnnouncement[];
  },

  async createAnnouncement(data: CreateAnnouncementData): Promise<QueueAnnouncement> {
    const response = await api.post('/queue/announcements', data);
    return response.data as QueueAnnouncement;
  },

  async resetQueue(data: ResetQueueData): Promise<void> {
    await api.post('/queue/reset', data);
  },
};