import { api } from "@/lib/api";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  clinicId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchInput {
  name: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  clinicId: string;
  isActive?: boolean;
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
}

export async function listBranches(clinicId: string): Promise<Branch[]> {
  const { data } = await api.get("/branches", { params: { clinicId } });
  return data;
}

export async function getBranchStats(clinicId: string): Promise<BranchStats> {
  const { data } = await api.get("/branches/stats", { params: { clinicId } });
  return data;
}

export async function createBranch(dto: CreateBranchInput): Promise<Branch> {
  const { data } = await api.post("/branches", dto);
  return data;
}

export async function updateBranch(id: string, dto: Partial<Branch>): Promise<Branch> {
  const { data } = await api.put(`/branches/${id}`, dto);
  return data;
}

export async function deleteBranch(id: string): Promise<void> {
  await api.delete(`/branches/${id}`);
}