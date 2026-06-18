"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Activity,
  AlertCircle,
  Timer,
  Printer,
  X,
  Play,
  CheckCircle2,
  Pause,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const stations = [
  { id: "all", label: "All Stations", count: 24, icon: Monitor },
  { id: "nursing", label: "Nursing", count: 8, icon: Activity },
  { id: "consultation", label: "Consultation", count: 6, icon: Stethoscope },
  { id: "optical", label: "Optical", count: 5, icon: Monitor },
  { id: "hmo", label: "HMO Queue", count: 5, icon: ShieldCheck },
];

const liveQueue = [
  { id: "V-024", patient: "Chidimma Okoro", station: "Nursing", status: "Waiting", time: "12 mins", type: "HMO", provider: "Reliance", priority: "Normal" },
  { id: "V-025", patient: "Babatunde Lawal", station: "Consultation", status: "In Progress", time: "25 mins", type: "Private", provider: "Self-Pay", priority: "Emergency" },
  { id: "V-026", patient: "Yuki Tanaka", station: "HMO Queue", status: "Verifying", time: "5 mins", type: "HMO", provider: "Axa Mansard", priority: "Normal" },
  { id: "V-027", patient: "Sarah Mensah", station: "Optical", status: "Waiting", time: "40 mins", type: "Private", provider: "Self-Pay", priority: "High" },
  { id: "V-028", patient: "Emeka Obi", station: "Nursing", status: "Completed", time: "1 hour", type: "HMO", provider: "Hygeia", priority: "Normal" },
];

export default function QueuePage() {
  const [activeStation, setActiveStation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Active Queue", value: "18", icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Avg. Wait Time", value: "14m", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Processed Today", value: "42", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Priority Cases", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Queue Overview</h1>
          <p className="text-slate-500 font-medium italic">Monitor and manage patient flow across all clinical stations.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Printer size={18} className="text-slate-400" />
              Print Status Report
           </button>
           <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
              <Users size={18} />
              Manage All Stations
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Queue Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left: Station Sidebar */}
        <div className="xl:col-span-1 space-y-4">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Stations</h2>
           <div className="space-y-2">
              {stations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStation(s.id)}
                  className={cn(
                    "w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between group",
                    activeStation === s.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20" 
                      : "bg-white border-slate-100 text-slate-600 hover:border-sky-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                       activeStation === s.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-sky-50"
                     )}>
                        <s.icon size={20} className={activeStation === s.id ? "text-sky-400" : "text-slate-400 group-hover:text-sky-600"} />
                     </div>
                     <span className="text-sm font-black">{s.label}</span>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    activeStation === s.id ? "bg-sky-500 text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    {s.count}
                  </span>
                </button>
              ))}
           </div>

           {/* HMO Alert Notice */}
           <div className="mt-8 bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <ShieldCheck size={40} className="mb-4 opacity-80" />
              <h3 className="text-lg font-black mb-1">HMO verification</h3>
              <p className="text-[11px] text-white/80 font-medium mb-4">5 patients currently waiting for insurance approval.</p>
              <button className="w-full py-3 bg-white text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                 Verify Queue <ArrowRight size={14} />
              </button>
           </div>
        </div>

        {/* Right: Live Queue Table */}
        <div className="xl:col-span-3 space-y-6">
           {/* Filters & Search */}
           <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Find patient in queue..." 
                   className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900"
                 />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                 <button className="flex-1 md:flex-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <Filter size={14} /> Priority
                 </button>
                 <button className="flex-1 md:flex-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <Timer size={14} /> Wait Time
                 </button>
              </div>
           </div>

           {/* Queue Table */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-slate-50">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue ID</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Station</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {liveQueue.map((item) => (
                         <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                               <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-slate-900/10">
                                  <span className="text-[10px] font-black opacity-60 leading-none">#</span>
                                  <span className="text-sm font-black leading-none mt-0.5">{item.id.split('-')[1]}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-[10px]">
                                     {item.patient.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        {item.patient}
                                        {item.priority === "Emergency" && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                                     </p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{item.type} • {item.provider}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                  <span className="text-xs font-bold text-slate-700">{item.station}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-1.5 text-slate-500">
                                  <Timer size={14} className={cn(item.time.includes('hour') ? "text-rose-500" : "text-amber-500")} />
                                  <span className="text-xs font-black">{item.time}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                 item.status === "Waiting" ? "bg-slate-100 text-slate-600" :
                                 item.status === "In Progress" ? "bg-sky-100 text-sky-700" :
                                 item.status === "Verifying" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                               )}>
                                 {item.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-100 shadow-sm transition-all" title="Start Activity">
                                     <Play size={14} />
                                  </button>
                                  <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 shadow-sm transition-all" title="Remove from Queue">
                                     <X size={14} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Quick Action Bar */}
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 p-6 rounded-[2rem] bg-sky-600 text-white flex items-center justify-between shadow-xl shadow-sky-900/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><UserCheck size={24} /></div>
                    <div>
                       <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Next in Queue</p>
                       <p className="text-lg font-black leading-none mt-0.5">Chidimma Okoro</p>
                    </div>
                 </div>
                 <button className="px-6 py-3 bg-white text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all">Call Now</button>
              </div>
              <div className="flex-1 p-6 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-between shadow-xl shadow-emerald-900/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><Activity size={24} /></div>
                    <div>
                       <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Capacity Overview</p>
                       <p className="text-lg font-black leading-none mt-0.5">75% Load (Stable)</p>
                    </div>
                 </div>
                 <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">Optimize</button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
