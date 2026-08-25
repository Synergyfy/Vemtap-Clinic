"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, Plus, MoreVertical, 
  ChevronRight, Building2, MapPin, Users,
  CheckCircle2, Clock, AlertCircle, Download,
  ExternalLink, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { OnboardingModal } from "@/components/popups/onboarding-modal";

const clinics = [
  { 
    id: "CLN-001", 
    name: "ClearVision Eye Clinic", 
    location: "Victoria Island, Lagos", 
    owner: "Dr. Sarah Johnson",
    email: "sarah@clearvision.com",
    plan: "Growth", 
    status: "Active",
    branches: 3,
    staff: 24,
    joined: "Oct 12, 2025"
  },
  { 
    id: "CLN-002", 
    name: "Lagos Vision Center", 
    location: "Ikeja, Lagos", 
    owner: "Ahmad Bello",
    email: "ahmad@lagosvision.com",
    plan: "Enterprise", 
    status: "Pending",
    branches: 8,
    staff: 156,
    joined: "Nov 05, 2025"
  },
  { 
    id: "CLN-003", 
    name: "Optimal Optical", 
    location: "Wuse II, Abuja", 
    owner: "Chioma Okoro",
    email: "chioma@optimal.com",
    plan: "Starter", 
    status: "Active",
    branches: 1,
    staff: 8,
    joined: "Dec 01, 2025"
  },
  { 
    id: "CLN-004", 
    name: "Precision Eyecare", 
    location: "Port Harcourt", 
    owner: "Dr. David Chen",
    email: "david@precision.com",
    plan: "Growth", 
    status: "Active",
    branches: 2,
    staff: 18,
    joined: "Jan 15, 2026"
  },
  { 
    id: "CLN-005", 
    name: "Elite Vision Hospital", 
    location: "Lekki Phase 1, Lagos", 
    owner: "Dr. Funmi Adebayo",
    email: "funmi@elitevision.com",
    plan: "Multi-Branch", 
    status: "Active",
    branches: 5,
    staff: 42,
    joined: "Feb 20, 2026"
  },
];

import { ClinicActionModal } from "@/components/popups/clinic-action-modal";

export default function ClinicsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeClinic, setActiveClinic] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-8">
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
      {activeClinic && (
        <ClinicActionModal 
          isOpen={!!activeClinic} 
          onClose={() => setActiveClinic(null)} 
          clinicId={activeClinic.id} 
          clinicName={activeClinic.name} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Clinics Management</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all healthcare providers on the Vemtap platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export List
          </Button>
          <Button variant="primary" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20" onClick={() => setIsOnboardingOpen(true)}>
            <Plus size={16} /> Onboard New Clinic
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by clinic name, ID, or owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              statusFilter === "all" ? "bg-brand-navy text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            All Clinics
          </button>
          <button 
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              statusFilter === "active" ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              statusFilter === "pending" ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            Pending
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-10 px-4 rounded-xl text-xs font-bold border-slate-100">
            <Filter size={16} /> Advanced Filters
          </Button>
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Usage</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clinics.map((clinic, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-soft-blue flex items-center justify-center text-brand-blue font-black border border-brand-blue/10">
                        {clinic.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <Link href={`/admin/clinics/${clinic.id}`} className="text-sm font-black text-brand-navy hover:text-brand-blue transition-colors block">
                          {clinic.name}
                        </Link>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                            <MapPin size={10} /> {clinic.location}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                            <Building2 size={10} /> {clinic.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                        clinic.plan === "Enterprise" ? "bg-purple-100 text-purple-700" :
                        clinic.plan === "Multi-Branch" ? "bg-brand-navy text-white" :
                        clinic.plan === "Growth" ? "bg-brand-soft-blue text-brand-blue" : "bg-slate-100 text-slate-600"
                      )}>
                        {clinic.plan}
                      </span>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                          <Building2 size={12} className="text-brand-blue" /> {clinic.branches} Br.
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                          <Users size={12} className="text-brand-blue" /> {clinic.staff} Staff
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      clinic.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {clinic.status === "Active" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {clinic.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    {clinic.joined}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/clinics/${clinic.id}`}>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-brand-soft-blue hover:text-brand-blue transition-all">
                          <ExternalLink size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl"
                        onClick={() => setActiveClinic({ id: clinic.id, name: clinic.name })}
                      >
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
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Showing 1 to 5 of 542 clinics</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200" disabled>Previous</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-brand-blue text-brand-blue">1</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-slate-200">2</Button>
            <Button variant="outline" className="rounded-xl font-bold w-10 h-10 p-0 bg-white border-slate-200">3</Button>
            <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-slate-200">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
