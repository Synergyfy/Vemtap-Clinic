import { api } from "@/lib/api";

export interface OpticalItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  type: string;
  frameSize?: string;
  lensType?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel?: number;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpticalItemData {
  name: string;
  brand?: string;
  category: string;
  type: string;
  frameSize?: string;
  lensType?: string;
  unitPrice: number;
  quantityInStock?: number;
  reorderLevel?: number;
  clinicId: string;
}

export interface UpdateOpticalItemData {
  name?: string;
  brand?: string;
  category?: string;
  type?: string;
  frameSize?: string;
  lensType?: string;
  unitPrice?: number;
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface OpticalItemQueryParams {
  clinicId?: string;
  category?: string;
  type?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function listOpticalItems(params: OpticalItemQueryParams = {}): Promise<OpticalItem[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const { data } = await api.get(`/optical/items?${searchParams.toString()}`);
  return data;
}

export async function getOpticalItem(id: string): Promise<OpticalItem> {
  const { data } = await api.get(`/optical/items/${id}`);
  return data;
}

export async function createOpticalItem(dto: CreateOpticalItemData): Promise<OpticalItem> {
  const { data } = await api.post("/optical/items", dto);
  return data;
}

export async function updateOpticalItem(id: string, dto: UpdateOpticalItemData): Promise<OpticalItem> {
  const { data } = await api.put(`/optical/items/${id}`, dto);
  return data;
}

export async function deleteOpticalItem(id: string): Promise<void> {
  await api.delete(`/optical/items/${id}`);
}

export async function listFrames(params: OpticalItemQueryParams = {}): Promise<OpticalItem[]> {
  return listOpticalItems({ ...params, category: 'Frames' });
}

export async function listLenses(params: OpticalItemQueryParams = {}): Promise<OpticalItem[]> {
  return listOpticalItems({ ...params, category: 'Lenses' });
}