"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, MapPin, Users, CheckCircle2, 
  ArrowLeft, Mail, Phone, Globe, Calendar,
  CreditCard, ShieldCheck, Activity, ListTodo,
  ExternalLink, MoreVertical, Plus, Search,
  TrendingUp, TrendingDown, Clock, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "staff", label: "Staff", icon: Users },
  { id: "revenue", label: "Revenue", icon: CreditCard },
  { id: "hmos", label: "HMOs", icon: ShieldCheck },
  { id: "audit", label: "Audit Logs", icon: ListTodo },
];

export default function ClinicDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for a single clinic
  const clinic = {
    id: id || "CLN-001",
    name: "ClearVision Eye Clinic",
    owner: "Dr. Sarah Johnson",
    email: "contact@clearvision.com",
    phone: "+234 812 345 6789",
    website: "www.clearvision.com",
    location: "Victoria Island, Lagos",
    plan: "Growth",
    status: "Active",
    joined: "Oct 12, 2025",
    stats: {
      totalRevenue: "$124,500",
      activePatients: "1,240",
      totalBranches: "3",
      totalStaff: "24",
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clinics">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Clinics
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200"></div>
        <p className="text-sm font-medium text-slate-500">Clinic Details / {clinic.id}</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-700"></div>
        
        <div className="flex flex-col lg:row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex flex-col md:row md:items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-brand-soft-blue flex items-center justify-center text-3xl font-black text-brand-blue border-4 border-white shadow-xl">
              {clinic.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-brand-navy">{clinic.name}</h1>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {clinic.status}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <User className="text-brand-blue" size={16} /> {clinic.owner}
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <MapPin className="text-brand-blue" size={16} /> {clinic.location}
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Mail className="text-brand-blue" size={16} /> {clinic.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Globe className="text-brand-blue" size={16} /> {clinic.website}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldAlert size={16} /> Suspend Clinic
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Settings2 size={16} /> Edit Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                : "text-slate-500 hover:text-brand-blue hover:bg-slate-50"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", val: clinic.stats.totalRevenue, icon: CreditCard, color: "blue", trend: "+12.5%" },
                  { label: "Active Patients", val: clinic.stats.activePatients, icon: Users, color: "emerald", trend: "+5.2%" },
                  { label: "Total Branches", val: clinic.stats.totalBranches, icon: MapPin, color: "purple", trend: "0%" },
                  { label: "Staff Strength", val: clinic.stats.totalStaff, icon: User, color: "amber", trend: "+2" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                        stat.color === "blue" ? "bg-blue-50 text-blue-500" :
                        stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                        stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-amber-50 text-amber-500"
                      )}>
                        <stat.icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{stat.trend}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                    <h4 className="text-xl font-black text-brand-navy">{stat.val}</h4>
                  </div>
                ))}
                
                <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-brand-navy mb-6">Recent Activity</h3>
                  <div className="space-y-6">
                    {[
                      { type: "staff", text: "New staff 'Dr. Emeka' added to VI Branch", time: "2 hours ago" },
                      { type: "billing", text: "Subscription renewed for Growth Plan", time: "1 day ago" },
                      { type: "hmo", text: "HMO Tariff updated for Reliance HMO", time: "3 days ago" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.text}</p>
                          <p className="text-xs text-slate-400">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1 bg-brand-navy p-8 rounded-[2.5rem] text-white">
                  <h3 className="text-lg font-bold mb-6">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current Plan</span>
                      <span className="font-bold text-brand-blue">Growth</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Next Billing</span>
                      <span className="font-bold">Oct 12, 2026</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">HMO Ratio</span>
                      <span className="font-bold">64.2%</span>
                    </div>
                  </div>
                  <Button className="w-full mt-10 bg-white text-brand-navy hover:bg-slate-100 font-bold rounded-xl text-sm">View Full Usage</Button>
                </div>
              </div>
            )}

            {activeTab === "branches" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-navy">Active Branches</h3>
                  <Button variant="primary" size="sm" className="gap-2"><Plus size={16} /> Add Branch</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-8 gap-6">
                  {[
                    { name: "Victoria Island (HQ)", address: "123 Adetokunbo Ademola", manager: "Sarah J.", phone: "+234 801..." },
                    { name: "Ikeja Branch", address: "45 Allen Avenue", manager: "Ahmad B.", phone: "+234 802..." },
                    { name: "Lekki Outlet", address: "Block A, Palms Mall", manager: "Chioma O.", phone: "+234 803..." },
                  ].map((br, i) => (
                    <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-blue shadow-sm">
                          <MapPin size={20} />
                        </div>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={14} />
                        </Button>
                      </div>
                      <h4 className="font-bold text-brand-navy mb-1">{br.name}</h4>
                      <p className="text-xs text-slate-500 mb-4">{br.address}</p>
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          <User size={12} className="text-brand-blue" /> {br.manager}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                          <Phone size={12} className="text-brand-blue" /> {br.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {["staff", "revenue", "hmos", "audit"].includes(activeTab) && (
              <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="text-slate-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">{tabs.find(t => t.id === activeTab)?.label} Data</h3>
                <p className="text-slate-500">This section will contain detailed {activeTab} analytics and management tools.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper icons
const User = ({ className, size }: { className?: string, size?: number }) => <Users className={className} size={size} />;
const Settings2 = ({ className, size }: { className?: string, size?: number }) => <Settings2 className={className} size={size} />;
