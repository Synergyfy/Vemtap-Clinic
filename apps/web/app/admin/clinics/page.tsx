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

const DownloadIcon = Download as React.ComponentType<{ size?: number; className?: string }>;
const PlusIcon = Plus as React.ComponentType<{ size?: number; className?: string }>;
const SearchIcon = Search as React.ComponentType<{ size?: number; className?: string }>;
const FilterIcon = Filter as React.ComponentType<{ size?: number; className?: string }>;
const MapPinIcon = MapPin as React.ComponentType<{ size?: number; className?: string }>;
const Building2Icon = Building2 as React.ComponentType<{ size?: number; className?: string }>;
const UsersIcon = Users as React.ComponentType<{ size?: number; className?: string }>;
const CheckCircle2Icon = CheckCircle2 as React.ComponentType<{ size?: number; className?: string }>;
const ClockIcon = Clock as React.ComponentType<{ size?: number; className?: string }>;
const ExternalLinkIcon = ExternalLink as React.ComponentType<{ size?: number; className?: string }>;
const MoreVerticalIcon = MoreVertical as React.ComponentType<{ size?: number; className?: string }>;

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
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Clinics Management</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all healthcare providers on the Vemtap platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <DownloadIcon size={16} /> Export List
          </Button>
          <Button variant="default" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20" onClick={() => setIsOnboardingOpen(true)}>
            <PlusIcon size={16} /> Onboard New Clinic
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
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
            <FilterIcon size={16} /> Advanced Filters
          </Button>
        </div>
      </div>

      {/* Clinics Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-205 w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="w-[38%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Clinic Details</th>
                <th className="w-[22%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan & Usage</th>
                <th className="w-[14%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="w-[14%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clinics.map((clinic, i) => (
                <tr key={i} className="group align-middle transition-colors hover:bg-slate-50/30">
                  <td className="px-6 py-5 align-middle">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-blue/10 bg-brand-soft-blue text-sm font-black text-brand-blue">
                        {clinic.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/clinics/${clinic.id}`} className="block truncate text-sm font-black text-brand-navy transition-colors hover:text-brand-blue">
                          {clinic.name}
                        </Link>
                        <div className="mt-1 flex min-w-0 items-center gap-4 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <MapPinIcon size={10} /> {clinic.location}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Building2Icon size={10} /> {clinic.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-middle">
                    <div className="min-w-0">
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                        clinic.plan === "Enterprise" ? "bg-purple-100 text-purple-700" :
                        clinic.plan === "Multi-Branch" ? "bg-brand-navy text-white" :
                        clinic.plan === "Growth" ? "bg-brand-soft-blue text-brand-blue" : "bg-slate-100 text-slate-600"
                      )}>
                        {clinic.plan}
                      </span>
                      <div className="mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Building2Icon size={12} className="text-brand-blue" /> {clinic.branches} Br.
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <UsersIcon size={12} className="text-brand-blue" /> {clinic.staff} Staff
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-middle">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                      clinic.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {clinic.status === "Active" ? <CheckCircle2Icon size={14} /> : <ClockIcon size={14} />}
                      {clinic.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 align-middle text-xs font-bold uppercase tracking-widest text-slate-500">
                    {clinic.joined}
                  </td>
                  <td className="px-6 py-5 text-right align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/clinics/${clinic.id}`}>
                        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl p-0 transition-all hover:bg-brand-soft-blue hover:text-brand-blue">
                          <ExternalLinkIcon size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 rounded-xl p-0"
                        onClick={() => setActiveClinic({ id: clinic.id, name: clinic.name })}
                      >
                        <MoreVerticalIcon size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-left text-xs font-black uppercase tracking-widest text-slate-400 sm:text-center">
            Showing 1 to 5 of 542 clinics
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 px-6 font-bold" disabled>Previous</Button>
            <Button variant="outline" className="h-10 w-10 rounded-xl border-brand-blue bg-white p-0 font-bold text-brand-blue">1</Button>
            <Button variant="outline" className="h-10 w-10 rounded-xl border-slate-200 bg-white p-0 font-bold">2</Button>
            <Button variant="outline" className="h-10 w-10 rounded-xl border-slate-200 bg-white p-0 font-bold">3</Button>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 px-6 font-bold">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
