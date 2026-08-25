"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  ClipboardList, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, FileText, Copy, Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const templateItems = [
  { id: "TMP-001", name: "Comprehensive Eye Exam", category: "General", fields: 24, status: "Published", lastUpdated: "2 days ago" },
  { id: "TMP-002", name: "Glaucoma Screening", category: "Specialized", fields: 18, status: "Published", lastUpdated: "1 week ago" },
  { id: "TMP-003", name: "Pediatric Consultation", category: "General", fields: 15, status: "Draft", lastUpdated: "Just now" },
  { id: "TMP-004", name: "Contact Lens Fitting", category: "Optometry", fields: 12, status: "Published", lastUpdated: "1 month ago" },
  { id: "TMP-005", name: "Pre-Operative Assessment", category: "Surgical", fields: 32, status: "Published", lastUpdated: "3 days ago" },
  { id: "TMP-006", name: "Post-Op Follow-up", category: "Surgical", fields: 10, status: "Published", lastUpdated: "2 weeks ago" },
];

export default function ConsultationTemplatesPage() {
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Consultation Templates</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight text-brand-navy">Consultation Templates</h1>
          <p className="text-slate-500 font-medium mt-1">Standardized exam forms for general eye checkups, glaucoma, and more.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export JSON
          </Button>
          <Button variant="primary" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20">
            <Plus size={16} /> Create Template
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Templates", val: "12", icon: ClipboardList, color: "amber" },
          { label: "Active Forms", val: "48", icon: FileText, color: "blue" },
          { label: "Avg. Fields", val: "18", icon: Layout, color: "purple" },
          { label: "Drafts", val: "2", icon: Clock, color: "rose" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "amber" ? "bg-amber-50 text-amber-500" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-rose-50 text-rose-500"
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
            placeholder="Search templates by name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Filter size={16} /> All Categories
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fields</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {templateItems.map((template, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600 group-hover:border-amber-500/20 transition-all">
                        <ClipboardList size={24} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-brand-navy">{template.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{template.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                      {template.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-sm font-black text-brand-navy">
                      <Layout size={16} className="text-slate-400" />
                      {template.fields} <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Inputs</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-500">
                    {template.lastUpdated}
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      template.status === "Published" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {template.status === "Published" ? <CheckCircle2 size={14} /> : <Edit3 size={14} />}
                      {template.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest text-brand-blue hover:bg-brand-soft-blue transition-all">
                        <Edit3 size={16} /> Design
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to 6 of 12 templates</p>
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
