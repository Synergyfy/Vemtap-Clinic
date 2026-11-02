"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  useReportTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useGenerateReport,
  useClinicalReports,
  useDeleteReport,
  useReportingStats,
  useScheduledTemplates,
  type ReportTemplate,
  type GeneratedReport,
  type ReportType,
  type ReportFormat,
  type ReportStatus,
  type ReportDeliveryMethod,
} from "@/hooks/useClinicalReporting";
import {
  FileText, Plus, Play, Download, Trash2, Edit3, Clock,
  Calendar, CheckCircle2, AlertCircle, Loader2, RefreshCw,
  Search, Filter, Check, Mail, FileSpreadsheet, FileCode,
  Layers, BarChart3, ArrowUpRight, ShieldCheck, Database
} from "lucide-react";

const REPORT_TYPES: { value: ReportType; label: string; description: string; color: string }[] = [
  { value: "patient_volume", label: "Patient Volume", description: "Inflow, footfall trends, and demographic counts", color: "from-blue-500 to-indigo-600" },
  { value: "appointment_utilization", label: "Appointment Utilization", description: "Slots, doctor load, and no-show statistics", color: "from-sky-500 to-cyan-600" },
  { value: "revenue_summary", label: "Revenue & Billing", description: "Total collections, HMO vs cash, and pending balances", color: "from-emerald-500 to-teal-600" },
  { value: "hmo_claims_analysis", label: "HMO Claims Analysis", description: "Approval ratios, pending amounts, and claim turnaround", color: "from-violet-500 to-purple-600" },
  { value: "surgery_schedule", label: "Surgery & Theater Audit", description: "Procedure completion, theater usage, and clinical outcomes", color: "from-rose-500 to-pink-600" },
  { value: "drug_usage", label: "Pharmacy & Drug Usage", description: "Dispensing frequency, inventory depletion, and formulary audits", color: "from-amber-500 to-orange-600" },
  { value: "patient_outcomes", label: "Clinical Outcomes", description: "Treatment efficacy, follow-up resolutions, and feedback", color: "from-emerald-600 to-green-700" },
  { value: "staff_productivity", label: "Staff Productivity", description: "Consultation times, tasks completed, and duty shifts", color: "from-cyan-600 to-blue-700" },
  { value: "inventory_levels", label: "Stock & Inventory Levels", description: "Reorder points, optical stock, and medication batches", color: "from-slate-600 to-slate-800" },
  { value: "custom", label: "Custom Clinical Query", description: "Tailored multi-parameter queries and ad-hoc exports", color: "from-fuchsia-600 to-pink-700" },
];

const FORMAT_ICONS: Record<ReportFormat, React.ElementType> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileSpreadsheet,
  json: FileCode,
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  pending: { label: "Pending", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: Clock },
  generating: { label: "Generating", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Loader2 },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Failed", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: AlertCircle },
};

type ActiveTab = "templates" | "reports" | "scheduled" | "stats";

export default function ClinicalReportingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("templates");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Queries
  const { data: templates = [], isLoading: tmplLoading, refetch: refetchTemplates } = useReportTemplates();
  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useClinicalReports();
  const { data: stats, isLoading: statsLoading } = useReportingStats();
  const { data: scheduledTemplates = [], isLoading: scheduledLoading } = useScheduledTemplates();

  // Mutations
  const createMut = useCreateTemplate();
  const updateMut = useUpdateTemplate();
  const deleteMut = useDeleteTemplate();
  const generateMut = useGenerateReport();
  const deleteReportMut = useDeleteReport();

  // Modal States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);

  const [templateForm, setTemplateForm] = useState<{
    name: string;
    description: string;
    type: ReportType;
    defaultFormat: ReportFormat;
    isActive: boolean;
    isScheduled: boolean;
    cronExpression: string;
    scheduledFormat: ReportFormat;
    queryConfig: string;
    defaultParameters: string;
    parameterSchema: string;
    scheduledParameters: string;
  }>({
    name: "",
    description: "",
    type: "patient_volume",
    defaultFormat: "pdf",
    isActive: true,
    isScheduled: false,
    cronExpression: "0 0 * * 1",
    scheduledFormat: "pdf",
    queryConfig: "{}",
    defaultParameters: "{}",
    parameterSchema: "{}",
    scheduledParameters: "{}",
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState<{
    templateId: string;
    format: ReportFormat;
    deliveryMethod: ReportDeliveryMethod;
    deliveryTarget: string;
    parameters: string;
  }>({
    templateId: "",
    format: "pdf",
    deliveryMethod: "download",
    deliveryTarget: "",
    parameters: "{}",
  });

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchType = selectedTypeFilter === "all" || t.type === selectedTypeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q));
      return matchType && matchQuery;
    });
  }, [templates, selectedTypeFilter, searchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = selectedStatusFilter === "all" || r.status === selectedStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (r.template && r.template.name.toLowerCase().includes(q)) ||
        (r.errorMessage && r.errorMessage.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [reports, selectedStatusFilter, searchQuery]);

  // Actions
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      type: "patient_volume",
      defaultFormat: "pdf",
      isActive: true,
      isScheduled: false,
      cronExpression: "0 0 * * 1",
      scheduledFormat: "pdf",
      queryConfig: "{}",
      defaultParameters: "{}",
      parameterSchema: "{}",
      scheduledParameters: "{}",
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (t: ReportTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({
      name: t.name || "",
      description: t.description || "",
      type: t.type,
      defaultFormat: t.defaultFormat || "pdf",
      isActive: t.isActive ?? true,
      isScheduled: t.isScheduled ?? false,
      cronExpression: t.cronExpression || "0 0 * * 1",
      scheduledFormat: t.scheduledFormat || "pdf",
      queryConfig: JSON.stringify(t.queryConfig ?? {}, null, 2),
      defaultParameters: JSON.stringify(t.defaultParameters ?? {}, null, 2),
      parameterSchema: JSON.stringify(t.parameterSchema ?? {}, null, 2),
      scheduledParameters: JSON.stringify(t.scheduledParameters ?? {}, null, 2),
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim()) {
      alert("Template name is required");
      return;
    }

    let parsedQueryConfig = {};
    let parsedDefaultParameters = {};
    let parsedParameterSchema = {};
    let parsedScheduledParameters = {};

    try {
      if (templateForm.queryConfig) parsedQueryConfig = JSON.parse(templateForm.queryConfig);
      if (templateForm.defaultParameters) parsedDefaultParameters = JSON.parse(templateForm.defaultParameters);
      if (templateForm.parameterSchema) parsedParameterSchema = JSON.parse(templateForm.parameterSchema);
      if (templateForm.scheduledParameters) parsedScheduledParameters = JSON.parse(templateForm.scheduledParameters);
    } catch {
      alert("Invalid JSON entered in configuration fields. Please verify JSON format.");
      return;
    }

    const payload = {
      name: templateForm.name.trim(),
      description: templateForm.description.trim() || undefined,
      type: templateForm.type,
      defaultFormat: templateForm.defaultFormat,
      isActive: templateForm.isActive,
      isScheduled: templateForm.isScheduled,
      cronExpression: templateForm.isScheduled ? templateForm.cronExpression : undefined,
      scheduledFormat: templateForm.isScheduled ? templateForm.scheduledFormat : undefined,
      queryConfig: parsedQueryConfig,
      defaultParameters: parsedDefaultParameters,
      parameterSchema: parsedParameterSchema,
      scheduledParameters: templateForm.isScheduled ? parsedScheduledParameters : undefined,
    };

    try {
      if (editingTemplate) {
        await updateMut.mutateAsync({ id: editingTemplate.id, dto: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setShowTemplateModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this report template?")) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete template");
    }
  };

  const handleOpenGenerate = (template?: ReportTemplate) => {
    const targetTemplate = template || templates[0];
    setGenerateForm({
      templateId: targetTemplate?.id || "",
      format: targetTemplate?.defaultFormat || "pdf",
      deliveryMethod: "download",
      deliveryTarget: "",
      parameters: JSON.stringify(targetTemplate?.defaultParameters || {}, null, 2),
    });
    setShowGenerateModal(true);
  };

  const handleRunGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.templateId) {
      alert("Please select a report template");
      return;
    }

    let parsedParams = {};
    try {
      if (generateForm.parameters) parsedParams = JSON.parse(generateForm.parameters);
    } catch {
      alert("Invalid JSON in parameters. Please provide valid JSON.");
      return;
    }

    try {
      await generateMut.mutateAsync({
        templateId: generateForm.templateId,
        format: generateForm.format,
        deliveryMethod: generateForm.deliveryMethod,
        deliveryTarget: generateForm.deliveryMethod !== "download" ? generateForm.deliveryTarget : undefined,
        parameters: parsedParams,
      });
      setShowGenerateModal(false);
      setActiveTab("reports");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to trigger report generation");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this generated report file?")) return;
    try {
      await deleteReportMut.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete report");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Clinical Reporting
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Automated clinical audits, business intelligence templates, and scheduled reports
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenGenerate()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all"
          >
            <Play size={15} /> Run Report
          </button>
          <button
            onClick={handleOpenCreateTemplate}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Report Templates",
            value: stats?.totalTemplates ?? templates.length,
            sub: `${templates.filter((t) => t.isActive).length} active`,
            icon: Layers,
            bg: "bg-indigo-50",
            color: "text-indigo-600",
          },
          {
            label: "Generated Reports",
            value: stats?.totalReports ?? reports.length,
            sub: `${reports.filter((r) => r.status === "completed").length} completed`,
            icon: FileText,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
          {
            label: "Automated Schedules",
            value: scheduledTemplates.length,
            sub: "recurring cron jobs",
            icon: Clock,
            bg: "bg-purple-50",
            color: "text-purple-600",
          },
          {
            label: "In Progress / Pending",
            value: (stats?.byStatus?.generating || 0) + (stats?.byStatus?.pending || 0),
            sub: "generation queue",
            icon: RefreshCw,
            bg: "bg-amber-50",
            color: "text-amber-600",
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", kpi.bg, kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        {[
          { id: "templates", label: "Report Templates", count: templates.length, icon: Layers },
          { id: "reports", label: "Generated Reports", count: reports.length, icon: FileText },
          { id: "scheduled", label: "Automated Schedules", count: scheduledTemplates.length, icon: Clock },
          { id: "stats", label: "Analytics & Health", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ActiveTab);
              setSearchQuery("");
            }}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Templates Catalog */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search templates by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Categories</option>
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          {tmplLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={28} />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading report templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <FileText size={26} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No report templates found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create clinical reporting templates for revenue, patient volume, drug usage, or surgical analytics.
              </p>
              <button
                onClick={handleOpenCreateTemplate}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Plus size={14} /> Create First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const typeMeta = REPORT_TYPES.find((rt) => rt.value === template.type);
                const FormatIcon = FORMAT_ICONS[template.defaultFormat] || FileText;

                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            template.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                          )}>
                            {template.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {typeMeta?.label || template.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditTemplate(template)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Template"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Template"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {template.description || "No description specified for this reporting template."}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Default Output:</span>
                          <span className="font-semibold uppercase flex items-center gap-1">
                            <FormatIcon size={12} className="text-indigo-500" />
                            {template.defaultFormat}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Automation:</span>
                          <span className={cn(
                            "font-semibold flex items-center gap-1",
                            template.isScheduled ? "text-purple-600" : "text-slate-400"
                          )}>
                            {template.isScheduled ? (
                              <>
                                <Clock size={11} /> {template.cronExpression || "Scheduled"}
                              </>
                            ) : (
                              "Manual Run"
                            )}
                          </span>
                        </div>
                        {template.lastRunAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Last Executed:</span>
                            <span className="font-semibold text-slate-700">
                              {new Date(template.lastRunAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGenerate(template)}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play size={13} /> Run Generation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Generated Reports History */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search reports by title or error..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {reportsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={28} />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading generated reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText size={26} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No generated reports</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Run a report from the templates catalog to create downloadable audit files.
                </p>
                <button
                  onClick={() => handleOpenGenerate()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Play size={14} /> Run Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Report / Template</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Delivery</th>
                      <th className="py-3 px-4">Generated By</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredReports.map((report) => {
                      const statusMeta = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusMeta.icon;
                      const FormatIcon = FORMAT_ICONS[report.format] || FileText;

                      return (
                        <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <FormatIcon size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{report.template?.name || "Clinical Report"}</p>
                                <p className="text-[10px] text-slate-400 font-medium">ID: {report.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                              statusMeta.bg,
                              statusMeta.text,
                              statusMeta.border
                            )}>
                              <StatusIcon size={12} className={report.status === "generating" ? "animate-spin" : ""} />
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 uppercase font-bold text-slate-700">
                            {report.format}
                            {report.fileSize ? (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {(report.fileSize / 1024).toFixed(1)} KB
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="capitalize font-medium">{report.deliveryMethod || "download"}</span>
                            {report.deliveryTarget && (
                              <span className="block text-[10px] text-slate-400">{report.deliveryTarget}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {report.generatedBy?.user
                              ? `${report.generatedBy.user.firstName || ""} ${report.generatedBy.user.lastName || ""}`.trim()
                              : "Staff"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(report.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                            {report.status === "completed" && report.fileUrl ? (
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[11px] transition-colors"
                              >
                                <Download size={13} /> Download
                              </a>
                            ) : null}
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Automated Schedules */}
      {activeTab === "scheduled" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Scheduled Clinical Reports</h3>
                <p className="text-xs text-slate-500">Autonomous report generation triggers powered by cron schedules</p>
              </div>
            </div>

            {scheduledLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto mb-2" size={24} />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading schedules...</p>
              </div>
            ) : scheduledTemplates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active scheduled templates found. Edit a template to enable cron scheduling.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledTemplates.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex items-start justify-between gap-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                        {s.type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Cron: <code className="bg-purple-100 px-1 py-0.5 rounded text-purple-800">{s.cronExpression}</code></p>
                      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Format: <strong className="uppercase">{s.scheduledFormat || s.defaultFormat}</strong></span>
                        {s.nextRunAt && (
                          <span>Next: <strong>{new Date(s.nextRunAt).toLocaleDateString()}</strong></span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenGenerate(s)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shrink-0"
                    >
                      Run Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics & Health */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Execution Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { status: "completed", label: "Completed", count: stats?.byStatus?.completed || 0, color: "bg-emerald-500" },
                  { status: "generating", label: "Generating", count: stats?.byStatus?.generating || 0, color: "bg-amber-500" },
                  { status: "pending", label: "Pending Queue", count: stats?.byStatus?.pending || 0, color: "bg-sky-500" },
                  { status: "failed", label: "Failed", count: stats?.byStatus?.failed || 0, color: "bg-rose-500" },
                ].map((item) => {
                  const total = stats?.totalReports || 1;
                  const pct = Math.round((item.count / total) * 100);

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Categories Supported</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {REPORT_TYPES.map((rt) => (
                  <div key={rt.value} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800">{rt.label}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{rt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Template */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={editingTemplate ? "Edit Report Template" : "New Clinical Report Template"}
        className="max-w-xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Template Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Monthly Cataract Surgical Audit"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Detailed description of the report's purpose and clinical scope..."
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Category / Type *
              </label>
              <select
                value={templateForm.type}
                onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as ReportType })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Default Format
              </label>
              <select
                value={templateForm.defaultFormat}
                onChange={(e) => setTemplateForm({ ...templateForm, defaultFormat: e.target.value as ReportFormat })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet (.xlsx)</option>
                <option value="csv">Comma-Separated (.csv)</option>
                <option value="json">Raw Data (.json)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={templateForm.isActive}
                onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              Active Template
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={templateForm.isScheduled}
                onChange={(e) => setTemplateForm({ ...templateForm, isScheduled: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              Enable Automated Cron Schedule
            </label>
          </div>

          {templateForm.isScheduled && (
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Cron Expression *
                  </label>
                  <input
                    type="text"
                    placeholder="0 0 * * 1 (Weekly on Monday)"
                    value={templateForm.cronExpression}
                    onChange={(e) => setTemplateForm({ ...templateForm, cronExpression: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-mono text-purple-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Scheduled Format
                  </label>
                  <select
                    value={templateForm.scheduledFormat}
                    onChange={(e) => setTemplateForm({ ...templateForm, scheduledFormat: e.target.value as ReportFormat })}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-purple-900 focus:outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Default Parameters (JSON)
            </label>
            <textarea
              rows={2}
              value={templateForm.defaultParameters}
              onChange={(e) => setTemplateForm({ ...templateForm, defaultParameters: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
              placeholder="{}"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowTemplateModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {createMut.isPending || updateMut.isPending ? "Saving..." : editingTemplate ? "Update Template" : "Save Template"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Generate Report */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Clinical Report"
        className="max-w-lg"
      >
        <form onSubmit={handleRunGenerate} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Template *
            </label>
            <select
              value={generateForm.templateId}
              onChange={(e) => {
                const sel = templates.find((t) => t.id === e.target.value);
                setGenerateForm({
                  ...generateForm,
                  templateId: e.target.value,
                  format: sel?.defaultFormat || generateForm.format,
                  parameters: JSON.stringify(sel?.defaultParameters || {}, null, 2),
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">-- Choose a report template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Output Format
              </label>
              <select
                value={generateForm.format}
                onChange={(e) => setGenerateForm({ ...generateForm, format: e.target.value as ReportFormat })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Delivery Method
              </label>
              <select
                value={generateForm.deliveryMethod}
                onChange={(e) => setGenerateForm({ ...generateForm, deliveryMethod: e.target.value as ReportDeliveryMethod })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="download">Direct Download</option>
                <option value="email">Email Notification</option>
                <option value="api">API Endpoint Push</option>
              </select>
            </div>
          </div>

          {generateForm.deliveryMethod !== "download" && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                {generateForm.deliveryMethod === "email" ? "Recipient Email Address *" : "Delivery Target Webhook *"}
              </label>
              <input
                type="text"
                required
                placeholder={generateForm.deliveryMethod === "email" ? "doctor@clinic.com" : "https://api.clinic.com/webhook"}
                value={generateForm.deliveryTarget}
                onChange={(e) => setGenerateForm({ ...generateForm, deliveryTarget: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Parameters Overrides (JSON)
            </label>
            <textarea
              rows={3}
              value={generateForm.parameters}
              onChange={(e) => setGenerateForm({ ...generateForm, parameters: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
              placeholder="{}"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMut.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {generateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {generateMut.isPending ? "Generating..." : "Generate Now"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
