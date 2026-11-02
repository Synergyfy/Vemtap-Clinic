import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listFeedback,
  submitFeedback,
  getFeedbackStats,
  deleteFeedback,
  type Feedback,
  type FeedbackStats,
  type CreateFeedbackDto,
} from "@/services/feedback.service";

const FEEDBACK_KEYS = {
  all: (clinicId: string) => ["feedback", clinicId] as const,
  stats: (clinicId: string) => ["feedback", "stats", clinicId] as const,
};

export type { Feedback, FeedbackStats, CreateFeedbackDto };

export function useFeedback(clinicIdOverride?: string) {
  const { user } = useAuth();
  const clinicId = clinicIdOverride || user?.clinicId;

  return useQuery({
    queryKey: FEEDBACK_KEYS.all(clinicId ?? ""),
    queryFn: () => listFeedback(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function useFeedbackStats(clinicIdOverride?: string) {
  const { user } = useAuth();
  const clinicId = clinicIdOverride || user?.clinicId;

  return useQuery({
    queryKey: FEEDBACK_KEYS.stats(clinicId ?? ""),
    queryFn: () => getFeedbackStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: Omit<CreateFeedbackDto, "clinicId"> & { clinicId?: string }) => {
      const clinicId = dto.clinicId || user?.clinicId;
      if (!clinicId) throw new Error("Clinic ID is required");
      return submitFeedback({ ...dto, clinicId });
    },
    onSuccess: (_, vars) => {
      const clinicId = vars.clinicId || user?.clinicId;
      if (clinicId) {
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.all(clinicId) });
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.stats(clinicId) });
      }
    },
  });
}

export function useDeleteFeedback() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.all(user.clinicId) });
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.stats(user.clinicId) });
      }
    },
  });
}
