"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  Frame, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, Tag, Box, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const frameItems = [
  { id: "FRM-001", brand: "Ray-Ban", model: "Aviator Classic", material: "Metal", gender: "Unisex", price: "$150.00" },
  { id: "FRM-002", brand: "Oakley", model: "Holbrook", material: "O Matter", gender: "Men", price: "$130.00" },
  { id: "FRM-003", brand: "Gucci", model: "GG0006O", material: "Acetate", gender: "Women", price: "$320.00" },
  { id: "FRM-004", brand: "Prada", model: "PR 16MV", material: "Plastic", gender: "Women", price: "$280.00" },
  { id: "FRM-005", brand: "Tom Ford", model: "FT5401", material: "Acetate", gender: "Men", price: "$350.00" },
  { id: "FRM-006", brand: "Vogue", model: "VO5211", material: "Nylon", gender: "Women", price: "$90.00" },
];

export default function FramesCatalogPage() {
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Frames Catalog</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight text-brand-navy">Frames Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Global frame directory with brand, material, and style tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export Inventory
          </Button>
          <Button variant="primary" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20">
            <Plus size={16} /> Add New Frame
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Styles", val: "15,400", icon: Frame, color: "purple" },
          { label: "Partner Brands", val: "84", icon: Briefcase, color: "blue" },
          { label: "Available Stock", val: "42,000", icon: Box, color: "emerald" },
          { label: "New Arrivals", val: "120", icon: Activity, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-amber-50 text-amber-500"
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
            placeholder="Search frames by brand or model..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Filter size={16} /> Material
          </Button>
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Briefcase size={16} /> Brand: All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand & Model</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {frameItems.map((frame, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-600 group-hover:border-purple-500/20 transition-all">
                        <Frame size={24} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-brand-navy">{frame.brand}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{frame.model} • {frame.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-600">
                    {frame.material}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                      {frame.gender}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-brand-navy">{frame.price}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={14} /> Available
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to 6 of 15,400 styles</p>
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
