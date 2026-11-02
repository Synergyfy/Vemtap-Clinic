import { api } from "@/lib/api";

export interface FeedbackPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export interface FeedbackStaff {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  category: string | null;
  patientId: string | null;
  patient?: FeedbackPatient | null;
  staffId?: string | null;
  staff?: FeedbackStaff | null;
  clinicId: string;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
}

export interface CreateFeedbackDto {
  rating: number;
  comment?: string;
  category?: string;
  patientId: string;
  staffId?: string;
  clinicId: string;
}

/**
 * GET /api/feedback
 * List feedback for clinic
 */
export async function listFeedback(clinicId: string): Promise<Feedback[]> {
  const { data } = await api.get("/feedback", { params: { clinicId } });
  return Array.isArray(data) ? data : data?.data || [];
}

/**
 * POST /api/feedback
 * Submit patient feedback
 */
export async function submitFeedback(dto: CreateFeedbackDto): Promise<Feedback> {
  const { data } = await api.post("/feedback", dto);
  return data;
}

/**
 * GET /api/feedback/stats
 * Get feedback stats for clinic
 */
export async function getFeedbackStats(clinicId: string): Promise<FeedbackStats> {
  const { data } = await api.get("/feedback/stats", { params: { clinicId } });
  return data;
}

/**
 * DELETE /api/feedback/{id}
 * Delete feedback
 */
export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/feedback/${id}`);
}

export const feedbackService = {
  listFeedback,
  submitFeedback,
  getFeedbackStats,
  deleteFeedback,
};
