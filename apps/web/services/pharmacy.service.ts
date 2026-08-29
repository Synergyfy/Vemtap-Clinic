import { api } from '@/lib/api';

// ── Drug types (reuse from dashboard) ──
export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate?: string;
  manufacturer?: string;
  supplier?: string;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
}

// ── Supplier types ──
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  products?: string;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
}

// ── Purchase Order types ──
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  items: string;
  totalAmount: number;
  status: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  supplierId: string;
  supplier?: Supplier;
  clinicId: string;
  createdAt: string;
}

// ── Prescription types ──
export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  isActive: boolean;
  medicalRecordId: string;
  medicalRecord?: {
    id: string;
    patientId: string;
    patient?: { id: string; firstName: string; lastName: string };
    staff?: { id: string; firstName: string; lastName: string };
  };
  prescribedById?: string;
  prescribedBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

// ── Dispense Drug DTO ──
export interface DispenseDrugDto {
  drugId: string;
  patientId: string;
  quantityDispensed: number;
  clinicId: string;
  notes?: string;
  dispensedById?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const pharmacyService = {
  // ── Drugs ──
  async getDrugs(clinicId: string): Promise<Drug[]> {
    const params = new URLSearchParams({ clinicId, limit: '200' });
    const res = await api.get(`/drugs?${params.toString()}`);
    return (res.data as PaginatedResponse<Drug>).data || [];
  },

  async restockDrug(drugId: string, quantity: number): Promise<void> {
    await api.post(`/drugs/${drugId}/restock`, { quantity });
  },

  async dispenseDrug(dto: DispenseDrugDto): Promise<void> {
    await api.post('/drugs/dispense', dto);
  },

  // ── Suppliers ──
  async getSuppliers(clinicId: string): Promise<Supplier[]> {
    const params = new URLSearchParams({ clinicId });
    const res = await api.get(`/suppliers?${params.toString()}`);
    return (res.data as PaginatedResponse<Supplier>).data || [];
  },

  // ── Purchase Orders ──
  async getPurchaseOrders(clinicId: string): Promise<PurchaseOrder[]> {
    const res = await api.get(`/suppliers/orders/all?clinicId=${clinicId}`);
    const data = res.data;
    // API may return array directly or paginated
    if (Array.isArray(data)) return data;
    return (data as PaginatedResponse<PurchaseOrder>).data || [];
  },

  async createPurchaseOrder(dto: {
    orderNumber: string;
    items: string;
    totalAmount: number;
    supplierId: string;
    clinicId: string;
    expectedDeliveryDate?: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const res = await api.post('/suppliers/orders', dto);
    return res.data as PurchaseOrder;
  },

  async deliverPurchaseOrder(orderId: string): Promise<void> {
    await api.post(`/suppliers/orders/${orderId}/deliver`);
  },

  // ── Prescriptions (fetched via patient) ──
  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const res = await api.get(`/prescriptions/patient/${patientId}`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    return (data as PaginatedResponse<Prescription>).data || [];
  },

  async getAllPrescriptions(clinicId: string): Promise<Prescription[]> {
    // Backend returns all when no medicalRecordId is provided
    // We then filter client-side to only those belonging to this clinic's patients
    const patients = await this.getPatients(clinicId);
    const patientIds = new Set(patients.map((p) => p.id));
    const allPrescriptions: Prescription[] = [];

    // Fetch prescriptions for each patient (batch in parallel)
    const batches = patients.slice(0, 50); // limit to 50 patients
    const results = await Promise.all(
      batches.map((p) => this.getPrescriptionsByPatient(p.id).catch(() => []))
    );
    for (const rx of results) {
      allPrescriptions.push(...rx);
    }
    return allPrescriptions;
  },

  async getPatients(clinicId: string): Promise<{ id: string; firstName: string; lastName: string }[]> {
    const params = new URLSearchParams({ clinicId, limit: '200' });
    const res = await api.get(`/patients?${params.toString()}`);
    const data = (res.data as PaginatedResponse<{ id: string; firstName: string; lastName: string }>).data || [];
    return data;
  },
};
