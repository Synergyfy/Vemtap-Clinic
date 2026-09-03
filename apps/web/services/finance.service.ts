import { api } from "@/lib/api";

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  recordedById: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  description: string;
  date: string;
  recordedById?: string;
  clinicId: string;
}

export interface UpdateExpenseData {
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  status?: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export async function listExpenses(params: { clinicId: string; category?: string; status?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
  const { data } = await api.get("/expenses", { params });
  return data;
}

export async function getExpense(id: string): Promise<Expense> {
  const { data } = await api.get(`/expenses/${id}`);
  return data;
}

export async function createExpense(dto: CreateExpenseData): Promise<Expense> {
  const { data } = await api.post("/expenses", dto);
  return data;
}

export async function updateExpense(id: string, dto: UpdateExpenseData): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, dto);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

export async function getExpenseSummary(clinicId: string): Promise<ExpenseSummary> {
  const { data } = await api.get("/expenses/summary", { params: { clinicId } });
  return data;
}
