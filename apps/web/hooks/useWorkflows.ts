import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listSettings, setSetting, deleteSetting, type ClinicSetting } from "@/services/settings.service";
import { useClinics } from "@/hooks/useClinics";

export interface WorkflowBlueprint {
  id: string;
  key: string;
  name: string;
  type: "Retail" | "Clinical" | "Field" | "Premium";
  steps: number;
  status: "Active" | "Draft";
  clinics: number;
}

const DEFAULT_WORKFLOWS: Omit<WorkflowBlueprint, "key">[] = [
  { id: "WFK-001", name: "Standard Retail Flow", type: "Retail", steps: 8, status: "Active", clinics: 0 },
  { id: "WFK-002", name: "Specialized Surgical Path", type: "Clinical", steps: 12, status: "Active", clinics: 0 },
  { id: "WFK-003", name: "Express Check-up", type: "Retail", steps: 4, status: "Active", clinics: 0 },
  { id: "WFK-004", name: "Mobile Clinic Outreach", type: "Field", steps: 6, status: "Draft", clinics: 0 },
  { id: "WFK-005", name: "VIP Executive Screening", type: "Premium", steps: 10, status: "Active", clinics: 0 },
];

export const WORKFLOW_KEYS = {
  all: ["workflows"] as const,
  list: (clinicId: string) => ["workflows", "list", clinicId] as const,
};

export function useWorkflowBlueprints() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || "platform-global";
  const { data: clinics = [] } = useClinics();

  return useQuery({
    queryKey: WORKFLOW_KEYS.list(clinicId),
    queryFn: async () => {
      try {
        const settings = await listSettings(clinicId, "workflows");
        if (settings && settings.length > 0) {
          return settings.map((s: ClinicSetting) => {
            try {
              const parsed = JSON.parse(s.value);
              return { ...parsed, key: s.key, id: s.key.replace("blueprint_", "") };
            } catch {
              return {
                id: s.key.replace("blueprint_", ""),
                key: s.key,
                name: s.value,
                type: "Clinical",
                steps: 6,
                status: "Active",
                clinics: clinics.length,
              } as WorkflowBlueprint;
            }
          });
        }
      } catch (err) {
        console.warn("Using default workflows structure", err);
      }

      // No workflow settings found – return empty list (no mock data)
      return [];
    },
  });
}

export function useSaveWorkflowBlueprint() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clinicId = user?.clinicId || "platform-global";

  return useMutation({
    mutationFn: async (blueprint: Omit<WorkflowBlueprint, "key">) => {
      const key = `blueprint_${blueprint.id || Date.now()}`;
      return setSetting(clinicId, {
        key,
        value: JSON.stringify(blueprint),
        category: "workflows",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}

export function useDeleteWorkflowBlueprint() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clinicId = user?.clinicId || "platform-global";

  return useMutation({
    mutationFn: async (key: string) => {
      return deleteSetting(clinicId, key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all });
    },
  });
}
