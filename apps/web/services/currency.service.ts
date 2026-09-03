import { api } from "@/lib/api";

export interface CurrencyConfig {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export async function listCurrencies(clinicId: string): Promise<CurrencyConfig[]> {
  const { data } = await api.get("/currency", { params: { clinicId } });
  return data;
}

export async function getBaseCurrency(clinicId: string): Promise<CurrencyConfig> {
  const { data } = await api.get("/currency/base", { params: { clinicId } });
  return data;
}

export async function createCurrency(dto: { code: string; name: string; symbol: string; exchangeRate: number; isBase?: boolean; clinicId: string }): Promise<CurrencyConfig> {
  const { data } = await api.post("/currency", dto);
  return data;
}

export async function updateCurrency(id: string, dto: Partial<{ exchangeRate: number; isBase: boolean }>): Promise<CurrencyConfig> {
  const { data } = await api.put(`/currency/${id}`, dto);
  return data;
}

export async function convertAmount(amount: number, from: string, to: string, clinicId: string): Promise<{ original: number; converted: number; rate: number }> {
  const { data } = await api.get("/currency/convert", { params: { amount, from, to, clinicId } });
  return data;
}
