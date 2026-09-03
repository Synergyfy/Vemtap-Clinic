import { api } from "@/lib/api";

export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  category: string;
  patientId: string | null;
  clinicId: string;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  byCategory: Record<string, number>;
}

export async function listFeedback(clinicId: string): Promise<Feedback[]> {
  const { data } = await api.get("/feedback", { params: { clinicId } });
  return data;
}

export async function submitFeedback(dto: { rating: number; comment?: string; category: string; clinicId: string }): Promise<Feedback> {
  const { data } = await api.post("/feedback", dto);
  return data;
}

export async function getFeedbackStats(clinicId: string): Promise<FeedbackStats> {
  const { data } = await api.get("/feedback/stats", { params: { clinicId } });
  return data;
}

export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/feedback/${id}`);
}
