import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listFeedback, submitFeedback, getFeedbackStats, deleteFeedback, type Feedback } from "@/services/feedback.service";

const FEEDBACK_KEYS = {
  all: (clinicId: string) => ["feedback", clinicId] as const,
  stats: (clinicId: string) => ["feedback", "stats", clinicId] as const,
};

export function useFeedback() {
  const { user } = useAuth();
  return useQuery({
    queryKey: FEEDBACK_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => listFeedback(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useFeedbackStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: FEEDBACK_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getFeedbackStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { rating: number; comment?: string; category: string }) =>
      submitFeedback({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.all(user.clinicId) });
        qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.stats(user.clinicId) });
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
      if (user?.clinicId) qc.invalidateQueries({ queryKey: FEEDBACK_KEYS.all(user.clinicId) });
    },
  });
}
