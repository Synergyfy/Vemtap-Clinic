"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  ClipboardList, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, FileText, Copy, Layout, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import {
  useReportTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  type ReportTemplate,
  type ReportType,
} from "@/hooks/useClinicalReporting";

export default function ConsultationTemplatesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "patient_volume" as ReportType,
  });

  const { data: templates = [], isLoading } = useReportTemplates();
  const createMutation = useCreateTemplate();
  const deleteMutation = useDeleteTemplate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name.trim()) return;

    try {
      await createMutation.mutateAsync({
        name: newTemplate.name,
        description: newTemplate.description || undefined,
        type: newTemplate.type,
        isActive: true,
      });
      setIsCreateOpen(false);
      setNewTemplate({
        name: "",
        description: "",
        type: "patient_volume",
      });
    } catch (err) {
      console.error("Failed to create template", err);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = templates.filter((t) => t.isActive).length;

  return (
    <div className="space-y-8">
      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Consultation / Clinical Template">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Template Title</label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20"
              placeholder="e.g. Comprehensive Refraction & Glaucoma Protocol"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Clinical Focus / Domain</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as ReportType })}
            >
              <option value="patient_volume">General Clinical Consultation</option>
              <option value="appointment_utilization">Glaucoma Protocol</option>
              <option value="patient_outcomes">Surgical Pre-Op / Post-Op</option>
              <option value="drug_usage">Pharmacotherapy Evaluation</option>
              <option value="inventory_levels">Optical Refraction Exam</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20"
              placeholder="Outline standard evaluation parameters and required clinical inputs..."
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Template"}
          </Button>
        </form>
      </Modal>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Config
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Consultation Templates</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Consultation Templates</h1>
          <p className="text-slate-500 font-medium mt-1">Standardized clinical assessment protocols across all connected provider clinics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateOpen(true)}
            variant="default" 
            size="sm" 
            className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            <Plus size={16} /> Create Template
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Templates", val: String(templates.length), icon: ClipboardList, color: "amber" },
          { label: "Active Protocols", val: String(activeCount), icon: FileText, color: "blue" },
          { label: "Clinical Domains", val: "5", icon: Layout, color: "purple" },
          { label: "Sync Status", val: "Live Verified", icon: CheckCircle2, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "amber" ? "bg-amber-50 text-amber-500" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-emerald-50 text-emerald-500"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-brand-navy">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search templates by title or domain..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                    <p className="mt-2 text-xs font-bold">Loading live consultation templates...</p>
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">No templates found</p>
                    <p className="text-xs text-slate-400 mt-1">Create your first examination template to standardize clinical forms.</p>
                    <Button 
                      onClick={() => setIsCreateOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="mt-4 rounded-xl font-bold"
                    >
                      <Plus size={14} className="mr-1" /> Create Template
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600 group-hover:border-amber-500/20 transition-all shrink-0">
                          <ClipboardList size={24} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-brand-navy truncate">{template.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{template.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                        {template.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy uppercase">
                        <Layout size={14} className="text-slate-400" />
                        {template.defaultFormat || "PDF / Form"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        template.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {template.isActive ? <CheckCircle2 size={14} /> : <Edit3 size={14} />}
                        {template.isActive ? "Active" : "Draft"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => deleteMutation.mutate(template.id)}
                          variant="ghost" 
                          size="sm" 
                          className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
