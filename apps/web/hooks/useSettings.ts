import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getSettingsMap, getCategorySettings, setSetting, bulkSetSettings,
  listWorkflows, createWorkflow, updateWorkflow, deleteWorkflow,
  listTemplates, createTemplate, updateTemplate, deleteTemplate,
  type SetSettingData, type Workflow, type Template,
  type CreateWorkflowData, type UpdateWorkflowData,
  type CreateTemplateData, type UpdateTemplateData,
} from "@/services/settings.service";

const SETTINGS_KEYS = {
  all: (clinicId: string) => ["settings", "all", clinicId] as const,
  category: (clinicId: string, category: string) => ["settings", "category", clinicId, category] as const,
  workflows: (clinicId: string) => ["settings", "workflows", clinicId] as const,
  templates: (clinicId: string) => ["settings", "templates", clinicId] as const,
};

export function useSettingsMap() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => getSettingsMap(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCategorySettings(category: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.category(user?.clinicId ?? "", category),
    queryFn: () => getCategorySettings(user!.clinicId, category),
    enabled: !!user?.clinicId,
  });
}

export function useWorkflows() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.workflows(user?.clinicId ?? ""),
    queryFn: () => import("@/services/settings.service").then(m => m.listWorkflows(user!.clinicId)),
    enabled: !!user?.clinicId,
  });
}

export function useTemplates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.templates(user?.clinicId ?? ""),
    queryFn: () => import("@/services/settings.service").then(m => m.listTemplates(user!.clinicId)),
    enabled: !!user?.clinicId,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateWorkflowData, "clinicId">) =>
      import("@/services/settings.service").then(m => m.createWorkflow(user!.clinicId, { ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "workflows", user.clinicId] });
    },
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWorkflowData }) =>
      import("@/services/settings.service").then(m => m.updateWorkflow(user!.clinicId, id, dto)),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "workflows", user.clinicId] });
    },
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/settings.service").then(m => m.deleteWorkflow(user!.clinicId, id)),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "workflows", user.clinicId] });
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateTemplateData, "clinicId">) =>
      import("@/services/settings.service").then(m => m.createTemplate(user!.clinicId, { ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "templates", user.clinicId] });
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTemplateData }) =>
      import("@/services/settings.service").then(m => m.updateTemplate(user!.clinicId, id, dto)),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "templates", user.clinicId] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/settings.service").then(m => m.deleteTemplate(user!.clinicId, id)),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["settings", "templates", user.clinicId] });
    },
  });
}

export function useSetSetting() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: SetSettingData) => setSetting(user!.clinicId, dto),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: SETTINGS_KEYS.all(user.clinicId) });
      }
    },
  });
}

export function useBulkSetSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (settings: SetSettingData[]) => bulkSetSettings(user!.clinicId, settings),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: SETTINGS_KEYS.all(user.clinicId) });
      }
    },
  });
}

export type { SetSettingData, Workflow, Template, CreateWorkflowData, UpdateWorkflowData, CreateTemplateData, UpdateTemplateData };