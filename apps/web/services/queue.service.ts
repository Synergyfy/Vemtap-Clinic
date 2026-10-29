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
  calledAt?: string | null;
  completedAt?: string | null;
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
  stage?: string;
  serviceType?: string;
  waitMinutes?: number;
  queueType?: string;
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

const normalizeQueueStatus = (value?: string | null): QueueStatus => {
  const normalized = (value ?? 'waiting').toLowerCase();

  switch (normalized) {
    case 'in-service':
    case 'in service':
    case 'in_progress':
    case 'in progress':
      return 'in_progress';
    case 'called':
      return 'called';
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'no_show':
    case 'no-show':
      return 'no_show';
    case 'waiting':
    default:
      return 'waiting';
  }
};

const normalizeQueueEntry = (entry: Partial<QueueEntry> = {}): QueueEntry => {
  const station = entry.station ?? entry.stage ?? 'reception';
  const priority = entry.priority ?? 'Normal';
  const status = normalizeQueueStatus(entry.status as string | undefined);

  return {
    id: entry.id ?? '',
    ticketNumber: entry.ticketNumber ?? 0,
    status,
    station,
    priority,
    notes: entry.notes ?? '',
    calledAt: entry.calledAt ?? null,
    completedAt: entry.completedAt ?? null,
    patientId: entry.patientId ?? '',
    patient: entry.patient,
    branchId: entry.branchId ?? '',
    clinicId: entry.clinicId ?? '',
    createdAt: entry.createdAt ?? new Date().toISOString(),
    updatedAt: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString(),
    stage: entry.stage ?? station,
    serviceType: entry.serviceType ?? station,
    queueType: entry.queueType ?? entry.serviceType ?? station,
    waitMinutes: entry.waitMinutes ?? 0,
  };
};

const buildDocsQueuePayload = (data: Partial<CreateQueueEntryData> & { stage?: string; serviceType?: string }) => ({
  patientId: data.patientId,
  branchId: data.branchId,
  clinicId: data.clinicId,
  station: data.station ?? data.stage ?? 'reception',
  priority: data.priority ?? 'Normal',
  notes: data.notes ?? '',
});

export const queueService = {
  async getAll(params: QueueQueryParams = {}): Promise<PaginatedQueueResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response = await api.get(`/queue?${searchParams.toString()}`);
    const rawData = response.data;
    const entries = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

    return {
      ...(typeof rawData === 'object' && rawData !== null ? rawData : {}),
      data: entries.map((entry: any) => normalizeQueueEntry(entry as Partial<QueueEntry>)),
    } as PaginatedQueueResponse;
  },

  async getById(id: string): Promise<QueueEntry> {
    const response = await api.get(`/queue/${id}`);
    return normalizeQueueEntry(response.data as Partial<QueueEntry>);
  },

  async create(data: CreateQueueEntryData): Promise<QueueEntry> {
    const response = await api.post('/queue', buildDocsQueuePayload(data));
    return normalizeQueueEntry(response.data as Partial<QueueEntry>);
  },

  async update(id: string, data: UpdateQueueEntryData): Promise<QueueEntry> {
    const payload = {
      ...(data.status ? { status: normalizeQueueStatus(data.status as string) } : {}),
      ...(data.station ? { station: data.station } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    const response = await api.put(`/queue/${id}`, payload);
    return normalizeQueueEntry(response.data as Partial<QueueEntry>);
  },

  async complete(id: string): Promise<QueueEntry> {
    const response = await api.put(`/queue/${id}/complete`);
    return normalizeQueueEntry(response.data as Partial<QueueEntry>);
  },

  async cancel(id: string): Promise<QueueEntry> {
    const response = await api.put(`/queue/${id}/cancel`);
    return normalizeQueueEntry(response.data as Partial<QueueEntry>);
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