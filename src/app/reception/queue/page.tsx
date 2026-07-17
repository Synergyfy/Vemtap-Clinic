"use client";

import React, { useState } from "react";
import { 
  Clock, Users, ShieldCheck, Search, Filter, MoreHorizontal, 
  ChevronRight, ArrowRight, UserCheck, Stethoscope, Activity,
  AlertCircle, Timer, Printer, X, Play, CheckCircle2, Pause, Monitor,
  RefreshCw, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";

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

const statusStyles: Record<string, string> = {
  "Waiting": "bg-slate-100 text-slate-600",
  "In Progress": "bg-sky-100 text-sky-700",
  "Verifying": "bg-amber-100 text-amber-700",
  "Completed": "bg-emerald-100 text-emerald-700",
};

const priorityIndicators: Record<string, string> = {
  "Emergency": "bg-rose-500",
  "High": "bg-amber-500",
  "Normal": "bg-slate-300",
};

export default function QueuePage() {
  const [activeStation, setActiveStation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showWaitTimeModal, setShowWaitTimeModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ item: typeof liveQueue[0]; action: 'start' | 'remove' } | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  const filteredQueue = liveQueue.filter(q =>
    (activeStation === "all" || q.station.toLowerCase() === activeStation) &&
    (searchQuery === "" || q.patient.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = [
    { label: "Active Queue", value: "18", icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Avg. Wait Time", value: "14m", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Processed Today", value: "42", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Priority Cases", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const renderQueueCard = (item: typeof liveQueue[0]) => (
    <div key={item.id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-900 text-white flex items-center justify-center shadow shrink-0">
            <span className="text-[8px] font-black opacity-60 leading-none">#</span>
            <span className="text-xs sm:text-sm font-black leading-none mt-0.5">{item.id.split('-')[1]}</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
              {item.patient}
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityIndicators[item.priority] || "bg-slate-300")} />
            </h4>
            <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">{item.type} &bull; {item.provider}</p>
          </div>
        </div>
        <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest shrink-0", statusStyles[item.status] || "bg-slate-100 text-slate-600")}>
          {item.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-slate-500">
            <Timer size={11} className={cn(item.time.includes('hour') ? "text-rose-500" : "text-amber-500")} />
            <span className="text-[10px] sm:text-xs font-black">{item.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-sky-400" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">{item.station}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowActionModal({ item, action: 'start' })}
            className="p-1.5 sm:p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">
            <Play size={11} />
          </button>
          <button onClick={() => setShowActionModal({ item, action: 'remove' })}
            className="p-1.5 sm:p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
            <X size={11} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Live Queue</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Monitor patient flow across all stations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           <button onClick={() => setShowPrintModal(true)}
             className="w-full sm:w-auto py-3 sm:py-4 px-5 sm:px-6 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm text-xs sm:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Printer size={16} className="text-slate-400" />
              Print Report
           </button>
           <button onClick={() => setShowStationModal(true)}
             className="w-full sm:w-auto py-3 sm:py-4 px-5 sm:px-8 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-900/20 text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Users size={16} />
              Manage Stations
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-5 group hover:shadow-md hover:border-sky-200 transition-all cursor-pointer"
          >
            <div className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Queue Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-8">
        
        {/* Left: Station Sidebar */}
        <div className="xl:col-span-1 space-y-3 sm:space-y-4">
           {/* Mobile: horizontal station chips */}
           <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
             {stations.map((s) => (
               <button key={s.id} onClick={() => setActiveStation(s.id)}
                 className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 whitespace-nowrap",
                   activeStation === s.id
                     ? "bg-slate-900 border-slate-900 text-white shadow"
                     : "bg-white border-slate-100 text-slate-600 hover:border-sky-200"
                 )}>
                 <s.icon size={14} />
                 <span className="text-[10px] font-black">{s.label}</span>
                 <span className={cn(
                   "px-1.5 py-0.5 rounded-full text-[8px] font-black",
                   activeStation === s.id ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
                 )}>{s.count}</span>
               </button>
             ))}
           </div>
           {/* Desktop: full sidebar buttons */}
           <h2 className="hidden md:block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Stations</h2>
           <div className="hidden md:block space-y-2">
             {stations.map((s) => (
               <button key={s.id} onClick={() => setActiveStation(s.id)}
                 className={cn(
                   "w-full p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border transition-all flex items-center justify-between group",
                   activeStation === s.id
                     ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
                     : "bg-white border-slate-100 text-slate-600 hover:border-sky-200"
                 )}>
                 <div className="flex items-center gap-3 sm:gap-4">
                   <div className={cn(
                     "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors",
                     activeStation === s.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-sky-50"
                   )}>
                     <s.icon size={18} className={activeStation === s.id ? "text-sky-400" : "text-slate-400 group-hover:text-sky-600"} />
                   </div>
                   <span className="text-sm font-black">{s.label}</span>
                 </div>
                 <span className={cn(
                   "px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                   activeStation === s.id ? "bg-sky-500 text-white" : "bg-slate-50 text-slate-400"
                 )}>{s.count}</span>
               </button>
             ))}
           </div>

           {/* HMO Alert Notice */}
           <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
              <ShieldCheck size={28} className="mb-3 sm:mb-4 opacity-80" />
              <h3 className="text-base sm:text-lg font-black mb-1">HMO verification</h3>
              <p className="text-[10px] sm:text-[11px] text-white/80 font-medium mb-3 sm:mb-4">5 patients waiting for insurance approval.</p>
              <button onClick={() => setShowVerifyModal(true)}
                className="w-full py-2.5 sm:py-3 bg-white text-amber-600 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                 Verify Queue <ArrowRight size={12} />
              </button>
           </div>
        </div>

        {/* Right: Live Queue */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
           {/* Filters & Search */}
           <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3 sm:gap-4">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Find patient in queue..."
                   className="w-full pl-10 sm:pl-14 pr-3 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                 <button onClick={() => setShowFilterModal(true)}
                   className="flex-1 md:flex-none px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-sky-50 hover:border-sky-100 transition-all justify-center">
                    <Filter size={12} /> Priority
                 </button>
                 <button onClick={() => setShowWaitTimeModal(true)}
                   className="flex-1 md:flex-none px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-amber-50 hover:border-amber-100 transition-all justify-center">
                    <Timer size={12} /> Wait Time
                 </button>
              </div>
           </div>

           {/* Mobile Card List */}
           <div className="md:hidden space-y-2 sm:space-y-3">
             {filteredQueue.map(renderQueueCard)}
           </div>

           {/* Desktop Queue Table */}
           <div className="hidden md:block bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
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
                       {filteredQueue.map((item) => (
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
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{item.type} &bull; {item.provider}</p>
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
                               <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", statusStyles[item.status] || "bg-slate-100 text-slate-600")}>
                                 {item.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setShowActionModal({ item, action: 'start' })}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-100 shadow-sm transition-all" title="Start Activity">
                                     <Play size={14} />
                                  </button>
                                  <button onClick={() => setShowActionModal({ item, action: 'remove' })}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 shadow-sm transition-all" title="Remove from Queue">
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
           <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="w-full flex-1 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] bg-sky-600 text-white flex items-center justify-between shadow-xl shadow-sky-900/10 gap-3">
                 <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><UserCheck size={20} /></div>
                    <div className="min-w-0">
                       <p className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest">Next in Queue</p>
                       <p className="text-sm sm:text-lg font-black leading-none mt-0.5 truncate">Chidimma Okoro</p>
                    </div>
                 </div>
                 <button onClick={() => setShowCallModal(true)}
                   className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-sky-600 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all shrink-0">Call Now</button>
              </div>
              <div className="w-full flex-1 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] bg-emerald-600 text-white flex items-center justify-between shadow-xl shadow-emerald-900/10 gap-3">
                 <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><Activity size={20} /></div>
                    <div className="min-w-0">
                       <p className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest">Capacity</p>
                       <p className="text-sm sm:text-lg font-black leading-none mt-0.5">75% Load</p>
                    </div>
                 </div>
                 <button onClick={() => setShowOptimizeModal(true)}
                   className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-emerald-600 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shrink-0">Optimize</button>
              </div>
           </div>
        </div>

      </div>

      {/* Print Status Report Modal */}
      <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Status Report">
        <div className="space-y-4 sm:space-y-5">
          <p className="text-sm text-slate-600">Queue status report for today:</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
            <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Total Patients</p><p className="text-lg sm:text-xl font-black text-slate-900">24</p></div>
            <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Processed</p><p className="text-lg sm:text-xl font-black text-slate-900">42</p></div>
            <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Avg Wait</p><p className="text-lg sm:text-xl font-black text-slate-900">14m</p></div>
            <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Pending</p><p className="text-lg sm:text-xl font-black text-slate-900">18</p></div>
          </div>
          <button onClick={() => { window.print(); setShowPrintModal(false); }}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
            <Printer size={14} /> Print Report
          </button>
        </div>
      </Modal>

      {/* Manage Stations Modal */}
      <Modal isOpen={showStationModal} onClose={() => setShowStationModal(false)} title="Manage Stations">
        <div className="space-y-3 sm:space-y-4">
          {stations.filter(s => s.id !== "all").map(s => (
            <div key={s.id} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><s.icon size={16} className="text-slate-600" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{s.label}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{s.count} patients</p>
                </div>
              </div>
              <button onClick={() => setShowStationModal(false)}
                className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-sky-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-sky-700 shrink-0">Open</button>
            </div>
          ))}
          <button onClick={() => setShowStationModal(false)}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Filter by Priority">
        <div className="space-y-2 sm:space-y-3">
          {["All", "Emergency", "High", "Normal"].map(priority => (
            <button key={priority} onClick={() => setShowFilterModal(false)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between hover:border-sky-200 transition-all">
              <span className="text-sm font-bold text-slate-700">{priority}</span>
              <span className={cn("w-2 h-2 rounded-full", priority === "Emergency" ? "bg-rose-500" : priority === "High" ? "bg-amber-500" : priority === "Normal" ? "bg-slate-400" : "bg-slate-300")} />
            </button>
          ))}
        </div>
      </Modal>

      {/* Wait Time Modal */}
      <Modal isOpen={showWaitTimeModal} onClose={() => setShowWaitTimeModal(false)} title="Filter by Wait Time">
        <div className="space-y-2 sm:space-y-3">
          {["All", "Under 10 mins", "10\u201320 mins", "20\u201330 mins", "Over 30 mins"].map(range => (
            <button key={range} onClick={() => setShowWaitTimeModal(false)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 hover:border-amber-200 transition-all text-left">{range}</button>
          ))}
        </div>
      </Modal>

      {/* Action Modal (Start / Remove) */}
      <Modal isOpen={!!showActionModal} onClose={() => setShowActionModal(null)} title={showActionModal?.action === 'start' ? 'Start Activity' : 'Remove from Queue'}>
        {showActionModal && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">{showActionModal.item.id.split('-')[1]}</div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{showActionModal.item.patient}</h4>
                <p className="text-xs sm:text-sm text-slate-500">{showActionModal.item.station} &bull; {showActionModal.item.time}</p>
              </div>
            </div>
            {showActionModal.action === 'start' ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">Begin processing at <strong>{showActionModal.item.station}</strong>?</p>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
                  <Play size={14} /> Start & Mark In Progress
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">Remove <strong>{showActionModal.item.patient}</strong> from queue?</p>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-700 flex items-center justify-center gap-2">
                  <X size={14} /> Remove from Queue
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Keep in Queue</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Verify Queue Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="HMO Verification Queue">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm text-slate-600">5 patients awaiting HMO verification:</p>
          {[
            { patient: "Chidimma Okoro", provider: "Reliance Health", code: "HMO-901" },
            { patient: "Yuki Tanaka", provider: "Axa Mansard", code: "HMO-902" },
            { patient: "Emeka Obi", provider: "Hygeia", code: "HMO-903" },
          ].map(item => (
            <div key={item.code} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.patient}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">{item.provider} &bull; {item.code}</p>
              </div>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-white text-amber-700 text-[7px] sm:text-[8px] font-black uppercase tracking-widest border border-amber-200 shrink-0">Pending</span>
            </div>
          ))}
          <button onClick={() => setShowVerifyModal(false)}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700">Verify All</button>
        </div>
      </Modal>

      {/* Call Now Modal */}
      <Modal isOpen={showCallModal} onClose={() => setShowCallModal(false)} title="Call Patient">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-sky-50 border border-sky-100 text-center">
            <UserCheck size={36} className="mx-auto text-sky-600 mb-2 sm:mb-3" />
            <h4 className="text-lg sm:text-xl font-black text-slate-900">Chidimma Okoro</h4>
            <p className="text-xs sm:text-sm text-slate-500">Queue ID: V-024</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 text-center">Notify patient to proceed to the designated station.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowCallModal(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Patient Called
            </button>
            <button onClick={() => setShowCallModal(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Dismiss</button>
          </div>
        </div>
      </Modal>

      {/* Optimize Modal */}
      <Modal isOpen={showOptimizeModal} onClose={() => setShowOptimizeModal(false)} title="Optimize Queue">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <BarChart3 size={20} className="text-emerald-600" />
              <div><p className="text-sm font-black text-slate-900">Current Load: 75%</p><p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Stable</p></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Suggestions</p>
            {["Move 1 patient Nursing → Consultation", "Open additional Optical triage", "Expedite HMO queue at Station 2"].map((s, i) => (
              <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-2 sm:gap-3">
                <RefreshCw size={14} className="text-sky-600 shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-slate-700">{s}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowOptimizeModal(false)}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Apply Optimizations
          </button>
        </div>
      </Modal>
    </div>
  );
}
