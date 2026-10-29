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
  notes?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CashierCartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface CashierPaymentEntry {
  method: 'cash' | 'card' | 'transfer' | 'hmo' | 'split' | string;
  amount: number;
  reference?: string;
}

export interface CashierTransaction {
  id: string;
  receiptNumber: string;
  items: CashierCartItem[];
  payments: CashierPaymentEntry[];
  subtotal: number;
  discount: number;
  total: number;
  paid?: number;
  balance?: number;
  status: string;
  cashierName: string;
  patientName?: string;
  note?: string;
  clinicId: string;
  shiftId?: string;
  timestamp?: string;
  createdAt: string;
  updatedAt?: string;
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
  updatedAt?: string;
}

export interface TransactionStats {
  totalRevenue: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalHmo: number;
  count: number;
}

export interface ShiftQueryParams {
  clinicId?: string;
  staffId?: string;
  status?: 'open' | 'closed' | string;
}

export interface OpenShiftDto {
  openingBalance: number;
  staffId: string;
  clinicId: string;
  notes?: string;
}

export interface CloseShiftDto {
  closingBalance: number;
  notes?: string;
}

export interface CompleteTransactionDto {
  items: CashierCartItem[];
  payments: CashierPaymentEntry[];
  discount?: number;
  patientName?: string;
  note?: string;
  clinicId: string;
}

export interface CreateProductDto {
  name: string;
  category: string;
  unitPrice: number;
  description?: string;
  stock?: number;
  clinicId: string;
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  unitPrice?: number;
  description?: string;
  stock?: number;
}

export const cashierService = {
  // ─── SHIFTS ───────────────────────────────────────────────
  /**
   * POST /api/cashier/shifts/open
   * Open a cashier shift
   */
  async openShift(dto: OpenShiftDto): Promise<CashierShift> {
    const res = await api.post('/cashier/shifts/open', dto);
    return res.data;
  },

  /**
   * PUT /api/cashier/shifts/{id}/close
   * Close a cashier shift
   */
  async closeShift(id: string, dto: CloseShiftDto): Promise<CashierShift> {
    const res = await api.put(`/cashier/shifts/${id}/close`, dto);
    return res.data;
  },

  /**
   * GET /api/cashier/shifts
   * List shifts
   */
  async getShifts(params?: ShiftQueryParams): Promise<CashierShift[]> {
    const q = new URLSearchParams();
    if (params?.clinicId) q.set('clinicId', params.clinicId);
    if (params?.staffId) q.set('staffId', params.staffId);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    const res = await api.get(`/cashier/shifts${qs ? `?${qs}` : ''}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  /**
   * GET /api/cashier/shifts/{id}
   * Get shift by ID
   */
  async getShift(id: string): Promise<CashierShift> {
    const res = await api.get(`/cashier/shifts/${id}`);
    return res.data;
  },

  /**
   * GET /api/cashier/shifts/open/{staffId}
   * Get open shift for staff
   */
  async getOpenShift(staffId: string): Promise<CashierShift | null> {
    const res = await api.get(`/cashier/shifts/open/${staffId}`);
    return res.data || null;
  },

  /**
   * GET /api/cashier/daily-summary
   * Get daily shift summary
   */
  async getDailySummary(clinicId: string): Promise<any> {
    const res = await api.get(`/cashier/daily-summary?clinicId=${clinicId}`);
    return res.data;
  },

  // ─── TRANSACTIONS ──────────────────────────────────────────
  /**
   * POST /api/cashier/transactions
   * Complete a transaction
   */
  async completeTransaction(dto: CompleteTransactionDto): Promise<CashierTransaction> {
    const res = await api.post('/cashier/transactions', dto);
    return res.data;
  },

  /**
   * GET /api/cashier/transactions
   * List transactions
   */
  async getTransactions(clinicId?: string): Promise<CashierTransaction[]> {
    const q = clinicId ? `?clinicId=${clinicId}` : '';
    const res = await api.get(`/cashier/transactions${q}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  /**
   * GET /api/cashier/transactions/stats
   * Get transaction statistics
   */
  async getTransactionStats(clinicId: string): Promise<TransactionStats> {
    const res = await api.get(`/cashier/transactions/stats?clinicId=${clinicId}`);
    return res.data;
  },

  /**
   * GET /api/cashier/transactions/{id}
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<CashierTransaction> {
    const res = await api.get(`/cashier/transactions/${id}`);
    return res.data;
  },

  /**
   * PUT /api/cashier/transactions/{id}/void
   * Void a transaction
   */
  async voidTransaction(id: string): Promise<CashierTransaction> {
    const res = await api.put(`/cashier/transactions/${id}/void`);
    return res.data;
  },

  // ─── PRODUCTS ──────────────────────────────────────────────
  /**
   * POST /api/cashier/products
   * Create POS product
   */
  async createProduct(dto: CreateProductDto): Promise<CashierProduct> {
    const res = await api.post('/cashier/products', dto);
    return res.data;
  },

  /**
   * GET /api/cashier/products
   * List POS products
   */
  async getProducts(clinicId?: string): Promise<CashierProduct[]> {
    const q = clinicId ? `?clinicId=${clinicId}` : '';
    const res = await api.get(`/cashier/products${q}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  /**
   * GET /api/cashier/products/{id}
   * Get product by ID
   */
  async getProduct(id: string): Promise<CashierProduct> {
    const res = await api.get(`/cashier/products/${id}`);
    return res.data;
  },

  /**
   * PUT /api/cashier/products/{id}
   * Update product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<CashierProduct> {
    const res = await api.put(`/cashier/products/${id}`, dto);
    return res.data;
  },

  /**
   * DELETE /api/cashier/products/{id}
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/cashier/products/${id}`);
  },
};
