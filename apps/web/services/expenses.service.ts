import { api } from "@/lib/api";

export type ExpenseCategory =
  | "utilities"
  | "salary"
  | "supplies"
  | "rent"
  | "maintenance"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "paid" | "rejected";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  status: ExpenseStatus;
  recordedById?: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  recordedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateExpenseDto {
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  recordedById?: string;
  clinicId: string;
}

export interface UpdateExpenseDto {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  date?: string;
  status?: ExpenseStatus;
}

export interface ExpenseQueryDto {
  clinicId?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

// ─── API Client Methods ───

export async function listExpenses(query: ExpenseQueryDto = {}): Promise<Expense[]> {
  const { data } = await api.get("/expenses", { params: query });
  return data;
}

export async function createExpense(dto: CreateExpenseDto): Promise<Expense> {
  const { data } = await api.post("/expenses", dto);
  return data;
}

export async function getExpenseSummary(clinicId: string): Promise<ExpenseSummary> {
  const { data } = await api.get("/expenses/summary", { params: { clinicId } });
  return data;
}

export async function getExpenseById(id: string): Promise<Expense> {
  const { data } = await api.get(`/expenses/${id}`);
  return data;
}

export async function updateExpense(id: string, dto: UpdateExpenseDto): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, dto);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
