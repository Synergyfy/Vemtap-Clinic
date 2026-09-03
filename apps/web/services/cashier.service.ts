import { api } from '@/lib/api';

export interface CashierShift {
  id: string;
  staffId: string;
  clinicId: string;
  cashierName?: string;
  staff?: { id: string; firstName: string; lastName: string };
  openingBalance: number;
  closingBalance?: number;
  expectedCash?: number;
  actualCash?: number;
  discrepancy?: number;
  status: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CashierTransaction {
  id: string;
  receiptNumber: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number; total: number; category: string }[];
  payments: { method: string; amount: number; reference?: string }[];
  subtotal: number;
  discount: number;
  total: number;
  paid?: number;
  balance?: number;
  status: string;
  cashierName: string;
  patientName?: string;
  clinicId: string;
  shiftId?: string;
  timestamp?: string;
  createdAt: string;
}

export interface CashierProduct {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  description?: string;
  stock?: number;
  clinicId: string;
  createdAt?: string;
}

export interface TransactionStats {
  totalRevenue: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalHmo: number;
  count: number;
}

export const cashierService = {
  // Shifts
  async openShift(dto: { openingBalance: number; staffId: string; clinicId: string; notes?: string }): Promise<CashierShift> {
    const res = await api.post('/cashier/shifts/open', dto);
    return res.data;
  },

  async closeShift(id: string, dto: { closingBalance: number; notes?: string }): Promise<CashierShift> {
    const res = await api.put(`/cashier/shifts/${id}/close`, dto);
    return res.data;
  },

  async getShifts(params?: { clinicId?: string; staffId?: string; status?: string }): Promise<CashierShift[]> {
    const q = new URLSearchParams();
    if (params?.clinicId) q.set('clinicId', params.clinicId);
    if (params?.staffId) q.set('staffId', params.staffId);
    if (params?.status) q.set('status', params.status);
    const res = await api.get(`/cashier/shifts?${q.toString()}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  async getOpenShift(staffId: string): Promise<CashierShift | null> {
    const res = await api.get(`/cashier/shifts/open/${staffId}`);
    return res.data || null;
  },

  async getDailySummary(clinicId: string): Promise<any> {
    const res = await api.get(`/cashier/daily-summary?clinicId=${clinicId}`);
    return res.data;
  },

  // Transactions
  async completeTransaction(dto: {
    items: { productId: string; name: string; quantity: number; unitPrice: number; total: number; category: string }[];
    payments: { method: string; amount: number; reference?: string }[];
    discount?: number;
    patientName?: string;
    note?: string;
    clinicId: string;
  }): Promise<CashierTransaction> {
    const res = await api.post('/cashier/transactions', dto);
    return res.data;
  },

  async getTransactions(clinicId?: string): Promise<CashierTransaction[]> {
    const q = clinicId ? `?clinicId=${clinicId}` : '';
    const res = await api.get(`/cashier/transactions${q}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  async getTransactionStats(clinicId: string): Promise<TransactionStats> {
    const res = await api.get(`/cashier/transactions/stats?clinicId=${clinicId}`);
    return res.data;
  },

  async getTransaction(id: string): Promise<CashierTransaction> {
    const res = await api.get(`/cashier/transactions/${id}`);
    return res.data;
  },

  async voidTransaction(id: string): Promise<CashierTransaction> {
    const res = await api.put(`/cashier/transactions/${id}/void`);
    return res.data;
  },

  // Products
  async getProducts(clinicId?: string): Promise<CashierProduct[]> {
    const q = clinicId ? `?clinicId=${clinicId}` : '';
    const res = await api.get(`/cashier/products${q}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  async createProduct(dto: { name: string; category: string; unitPrice: number; description?: string; stock?: number; clinicId: string }): Promise<CashierProduct> {
    const res = await api.post('/cashier/products', dto);
    return res.data;
  },

  async updateProduct(id: string, dto: Partial<CashierProduct>): Promise<CashierProduct> {
    const res = await api.put(`/cashier/products/${id}`, dto);
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/cashier/products/${id}`);
  },
};
