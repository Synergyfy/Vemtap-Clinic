import { api } from "@/lib/api";

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  revenue: number;
  activePatients: number;
  status: "Active" | "Closed";
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchStats {
  total: number;
  totalRevenue: number;
  totalActivePatients: number;
  byStatus: Record<string, number>;
}

export async function listBranches(clinicId: string): Promise<Branch[]> {
  const { data } = await api.get("/branches", { params: { clinicId } });
  return data;
}

export async function getBranchStats(clinicId: string): Promise<BranchStats> {
  const { data } = await api.get("/branches/stats", { params: { clinicId } });
  return data;
}

export async function createBranch(dto: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<Branch> {
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