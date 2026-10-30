"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  Zap, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, GitBranch, Network, Settings, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { 
  useWorkflowBlueprints, 
  useSaveWorkflowBlueprint, 
  useDeleteWorkflowBlueprint,
  type WorkflowBlueprint
} from "@/hooks/useWorkflows";
import { useClinics } from "@/hooks/useClinics";

export default function WorkflowBlueprintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBlueprint, setNewBlueprint] = useState({
    name: "",
    type: "Retail" as const,
    steps: 6,
    status: "Active" as const,
  });

  const { data: workflows = [], isLoading } = useWorkflowBlueprints();
  const { data: clinics = [] } = useClinics();
  const saveMutation = useSaveWorkflowBlueprint();
  const deleteMutation = useDeleteWorkflowBlueprint();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlueprint.name.trim()) return;

    try {
      const id = `WFK-00${workflows.length + 1}`;
      await saveMutation.mutateAsync({
        ...newBlueprint,
        id,
        clinics: clinics.length,
      });
      setIsAddModalOpen(false);
      setNewBlueprint({
        name: "",
        type: "Retail",
        steps: 6,
        status: "Active",
      });
    } catch (err) {
      console.error("Failed to save workflow blueprint", err);
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNodes = workflows.reduce((acc, curr) => acc + (curr.steps || 0), 0);
  const activeCount = workflows.filter(w => w.status === "Active").length;
  const clinicAdoption = clinics.length > 0 ? "100%" : "Live Sync";

  return (
    <div className="space-y-8">
      {/* Create Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Workflow Blueprint">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Blueprint Name</label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-blue/20"
              placeholder="e.g. Rapid Glaucoma Evaluation Flow"
              value={newBlueprint.name}
              onChange={(e) => setNewBlueprint({ ...newBlueprint, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Flow Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
                value={newBlueprint.type}
                onChange={(e) => setNewBlueprint({ ...newBlueprint, type: e.target.value as any })}
              >
                <option value="Retail">Retail</option>
                <option value="Clinical">Clinical</option>
                <option value="Field">Field</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Sequence Nodes / Steps</label>
              <input
                type="number"
                min="1"
                max="30"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={newBlueprint.steps}
                onChange={(e) => setNewBlueprint({ ...newBlueprint, steps: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20 mt-2"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Workflow Blueprint"}
          </Button>
        </form>
      </Modal>

      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Config
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Workflow Blueprints</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight text-brand-navy">Workflow Blueprints</h1>
          <p className="text-slate-500 font-medium mt-1">Configure default clinical and operational paths for connected clinics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            variant="default" 
            size="sm" 
            className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            <Plus size={16} /> New Blueprint
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Blueprints", val: String(workflows.length), icon: Zap, color: "rose" },
          { label: "Active Nodes", val: String(totalNodes), icon: Network, color: "blue" },
          { label: "Active Blueprints", val: String(activeCount), icon: Building2, color: "emerald" },
          { label: "Connected Clinics", val: String(clinics.length), icon: Activity, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "rose" ? "bg-rose-50 text-rose-500" :
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
            placeholder="Search blueprints by name or type..." 
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Steps</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Adoption</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                    <p className="mt-2 text-xs font-bold">Loading live workflow blueprints...</p>
                  </td>
                </tr>
              ) : filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">No workflow blueprints found</p>
                    <p className="text-xs text-slate-400 mt-1">Configure clinical or retail flows for clinics on the network.</p>
                    <Button 
                      onClick={() => setIsAddModalOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="mt-4 rounded-xl font-bold"
                    >
                      <Plus size={14} className="mr-1" /> New Blueprint
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-500/10 group-hover:text-rose-600 group-hover:border-rose-500/20 transition-all shrink-0">
                          <Zap size={24} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-brand-navy truncate">{workflow.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{workflow.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                        workflow.type === "Retail" ? "bg-purple-100 text-purple-700" :
                        workflow.type === "Clinical" ? "bg-blue-100 text-blue-700" :
                        workflow.type === "Premium" ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {workflow.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-sm font-black text-brand-navy">
                        <GitBranch size={16} className="text-slate-400" />
                        {workflow.steps} <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Nodes</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-sm font-black text-brand-navy">
                        <Building2 size={16} className="text-brand-blue" />
                        {workflow.clinics} <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Clinics</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        workflow.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {workflow.status === "Active" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {workflow.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {workflow.key && (
                          <Button 
                            onClick={() => deleteMutation.mutate(workflow.key)}
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
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
