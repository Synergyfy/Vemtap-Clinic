import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unitPrice: number;
  quantityInStock: number | null;
  reorderLevel: number | null;
  sku: string | null;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  quantityInStock?: number;
  reorderLevel?: number;
  sku?: string;
  clinicId: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export async function listProducts(clinicId?: string): Promise<Product[]> {
  const params = clinicId ? { clinicId } : {};
  const { data } = await api.get("/products", { params });
  return data;
}

export async function createProduct(dto: CreateProductData): Promise<Product> {
  const { data } = await api.post("/products", dto);
  return data;
}

export async function updateProduct(id: string, dto: UpdateProductData): Promise<Product> {
  const { data } = await api.put(`/products/${id}`, dto);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
