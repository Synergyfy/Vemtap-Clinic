import { api } from "@/lib/api";

export type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  id: string;
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  exchangeRateToBase: number;
  isBase: boolean;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyConfigDto {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  exchangeRateToBase?: number;
  isBase?: boolean;
  isActive?: boolean;
  clinicId: string;
}

export interface UpdateCurrencyConfigDto {
  symbol?: string;
  name?: string;
  locale?: string;
  exchangeRateToBase?: number;
  isBase?: boolean;
  isActive?: boolean;
}

export interface CurrencyConfigQueryDto {
  code?: CurrencyCode;
  isActive?: boolean;
  isBase?: boolean;
  clinicId?: string;
}

export interface CurrencyStats {
  total: number;
  active: number;
  base: string | null;
}

// ─── API Functions ───

export async function createCurrency(
  dto: CreateCurrencyConfigDto
): Promise<CurrencyConfig> {
  const { data } = await api.post("/currency", dto);
  return data;
}

export async function listCurrencies(
  queryOrClinicId?: CurrencyConfigQueryDto | string
): Promise<CurrencyConfig[]> {
  const params =
    typeof queryOrClinicId === "string"
      ? { clinicId: queryOrClinicId }
      : queryOrClinicId || {};
  const { data } = await api.get("/currency", { params });
  return data;
}

export async function getBaseCurrency(
  clinicId: string
): Promise<CurrencyConfig | null> {
  const { data } = await api.get("/currency/base", { params: { clinicId } });
  return data;
}

export async function getCurrencyStats(
  clinicId: string
): Promise<CurrencyStats> {
  const { data } = await api.get("/currency/stats", { params: { clinicId } });
  return data;
}

export async function getCurrencyById(id: string): Promise<CurrencyConfig> {
  const { data } = await api.get(`/currency/${id}`);
  return data;
}

export async function updateCurrency(
  id: string,
  dto: UpdateCurrencyConfigDto
): Promise<CurrencyConfig> {
  const { data } = await api.put(`/currency/${id}`, dto);
  return data;
}

export async function deleteCurrency(id: string): Promise<void> {
  await api.delete(`/currency/${id}`);
}

export async function convertAmount(
  amount: number,
  from: string,
  to: string,
  clinicId: string
): Promise<number> {
  const { data } = await api.get("/currency/convert", {
    params: {
      amount: String(amount),
      from,
      to,
      clinicId,
    },
  });
  return typeof data === "number" ? data : Number(data?.converted ?? data);
}
