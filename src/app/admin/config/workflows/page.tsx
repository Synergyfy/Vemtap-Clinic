"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  Zap, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, GitBranch, Network, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const workflowItems = [
  { id: "WFK-001", name: "Standard Retail Flow", type: "Retail", steps: 8, status: "Active", clinics: 142 },
  { id: "WFK-002", name: "Specialized Surgical Path", type: "Clinical", steps: 12, status: "Active", clinics: 24 },
  { id: "WFK-003", name: "Express Check-up", type: "Retail", steps: 4, status: "Active", clinics: 85 },
  { id: "WFK-004", name: "Mobile Clinic Outreach", type: "Field", steps: 6, status: "Draft", clinics: 0 },
  { id: "WFK-005", name: "VIP Executive Screening", type: "Premium", steps: 10, status: "Active", clinics: 12 },
  { id: "WFK-006", name: "Glaucoma Clinic Flow", type: "Clinical", steps: 15, status: "Active", clinics: 18 },
];

export default function WorkflowBlueprintsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
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
          <p className="text-slate-500 font-medium mt-1">Configure default clinical and operational paths for different clinic types.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export Config
          </Button>
          <Button variant="primary" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20">
            <Plus size={16} /> New Blueprint
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Blueprints", val: "5", icon: Zap, color: "rose" },
          { label: "Active Nodes", val: "248", icon: Network, color: "blue" },
          { label: "Clinic Adoption", val: "92%", icon: Building2, color: "emerald" },
          { label: "Optimizations", val: "14", icon: Activity, color: "purple" },
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
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Filter size={16} /> Filter by Type
          </Button>
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
              {workflowItems.map((workflow, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-500/10 group-hover:text-rose-600 group-hover:border-rose-500/20 transition-all">
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-brand-navy">{workflow.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{workflow.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                      workflow.type === "Clinical" ? "bg-blue-100 text-blue-700" : 
                      workflow.type === "Retail" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
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
                      {workflow.status === "Active" ? <CheckCircle2 size={14} /> : <Edit3 size={14} />}
                      {workflow.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest text-brand-blue hover:bg-brand-soft-blue transition-all">
                        <Settings size={16} /> Configure
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to 6 of 5 blueprints</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200">Previous</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-brand-blue text-brand-blue">1</Button>
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
