"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  Pill, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, Package, Tag, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const drugItems = [
  { id: "DRG-001", name: "Ciprofloxacin Eye Drops", category: "Antibiotics", stock: 1240, status: "In Stock", price: "$15.00" },
  { id: "DRG-002", name: "Latanoprost", category: "Glaucoma", stock: 850, status: "In Stock", price: "$45.00" },
  { id: "DRG-003", name: "Tropicamide", category: "Mydriatics", stock: 154, status: "Low Stock", price: "$12.00" },
  { id: "DRG-004", name: "Artificial Tears", category: "Lubricants", stock: 2100, status: "In Stock", price: "$8.50" },
  { id: "DRG-005", name: "Prednisolone", category: "Steroids", stock: 0, status: "Out of Stock", price: "$22.00" },
  { id: "DRG-006", name: "Timolol Maleate", category: "Glaucoma", stock: 450, status: "In Stock", price: "$18.00" },
];

export default function DrugDatabasePage() {
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Drug Database</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight text-brand-navy">Drug Database</h1>
          <p className="text-slate-500 font-medium mt-1">Manage global pharmacy catalog and inventory defaults.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export Catalog
          </Button>
          <Button variant="primary" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20">
            <Plus size={16} /> Add New Drug
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Drugs", val: "4,250", icon: Pill, color: "emerald" },
          { label: "Active Prescriptions", val: "8,920", icon: Activity, color: "blue" },
          { label: "Categories", val: "24", icon: Layers, color: "purple" },
          { label: "Out of Stock", val: "12", icon: AlertCircle, color: "rose" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
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
            placeholder="Search drugs by name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Filter size={16} /> Filter Category
          </Button>
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Tag size={16} /> Pricing Tier
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drug Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drugItems.map((drug, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 group-hover:border-emerald-500/20 transition-all">
                        <Pill size={24} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-brand-navy">{drug.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{drug.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                      {drug.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-sm font-black text-brand-navy">
                      <Package size={16} className="text-slate-400" />
                      {drug.stock} <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-brand-navy">{drug.price}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      drug.status === "In Stock" ? "bg-emerald-50 text-emerald-600" : 
                      drug.status === "Low Stock" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {drug.status === "In Stock" ? <CheckCircle2 size={14} /> : drug.status === "Low Stock" ? <Clock size={14} /> : <AlertCircle size={14} />}
                      {drug.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest text-brand-blue hover:bg-brand-soft-blue transition-all">
                        <Edit3 size={16} /> Edit
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to 6 of 4,250 drugs</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200">Previous</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-brand-blue text-brand-blue">1</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-slate-200">2</Button>
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
