"use client";

import React, { useState, useMemo } from "react";
import {
  Clock, Users, ShieldCheck, Search, Filter,
  UserCheck, Stethoscope, Activity,
  AlertCircle, Timer, Printer, X, Play, CheckCircle2, Monitor,
  Plus, Trash2, Megaphone, DoorOpen, Eye, ArrowRight, Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import {
  useQueueStore,
  getQueueTypeLabel,
  getStatusColor,
  type QueueType,
  type Priority,
  type PatientType,
  type QueueStatus,
  type QueueEntry,
  type RoomStatus
} from "@/store/queueStore";

const stationFilters = [
  { id: "all", label: "All Stations", icon: Monitor },
  { id: "consultation", label: "Consultation", icon: Stethoscope },
  { id: "eye-test", label: "Eye Test", icon: Eye },
  { id: "optical", label: "Optical", icon: Eye },
  { id: "pharmacy", label: "Pharmacy", icon: Activity },
  { id: "emergency", label: "Emergency", icon: AlertCircle },
];

const priorityIndicators: Record<string, string> = {
  Emergency: "bg-rose-500",
  High: "bg-amber-500",
  Normal: "bg-slate-300",
};

export default function QueuePage() {
  const entries = useQueueStore((s) => s.entries);
  const stations = useQueueStore((s) => s.stations);
  const rooms = useQueueStore((s) => s.rooms);
  const announcements = useQueueStore((s) => s.announcements);
  const addEntry = useQueueStore((s) => s.addEntry);
  const removeEntry = useQueueStore((s) => s.removeEntry);
  const updateStatus = useQueueStore((s) => s.updateStatus);
  const callPatient = useQueueStore((s) => s.callPatient);
  const updateEntry = useQueueStore((s) => s.updateEntry);
  const updateRoomStatus = useQueueStore((s) => s.updateRoomStatus);
  const addAnnouncement = useQueueStore((s) => s.addAnnouncement);
  const removeAnnouncement = useQueueStore((s) => s.removeAnnouncement);

  const [activeStation, setActiveStation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState<QueueEntry | null>(null);
  const [callEdit, setCallEdit] = useState<QueueEntry | null>(null);
  const [showActionModal, setShowActionModal] = useState<{ entry: QueueEntry; action: "start" | "complete" | "remove" } | null>(null);
  const [showStationsModal, setShowStationsModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const doctors = useMemo(() => {
    const fromRooms = rooms.map((r) => r.doctorName);
    const fromStations = stations.map((s) => s.doctorName).filter(Boolean) as string[];
    return [...new Set([...fromRooms, ...fromStations])].sort();
  }, [rooms, stations]);

  const [addForm, setAddForm] = useState({
    patientName: "",
    queueType: "consultation" as QueueType,
    priority: "Normal" as Priority,
    patientType: "Private" as PatientType,
    provider: "Self-Pay",
    station: "Nursing",
    assignedDoctor: "",
    reason: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState("");

  const filteredQueue = useMemo(() => {
    return entries.filter((e) => {
      if (activeStation !== "all" && e.queueType !== activeStation) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (priorityFilter !== "all" && e.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.patientName.toLowerCase().includes(q) ||
          e.ticketNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, activeStation, statusFilter, priorityFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = entries.filter((e) => e.status !== "Completed" && e.status !== "No Show");
    const waiting = active.filter((e) => e.status === "Waiting");
    const inProgress = active.filter((e) => e.status === "In Progress");
    const called = active.filter((e) => e.status === "Called");
    const emergency = active.filter((e) => e.priority === "Emergency");
    const avgWait = waiting.length
      ? Math.round(waiting.reduce((s, e) => s + e.waitTimeMinutes, 0) / waiting.length)
      : 0;
    return {
      active: active.length,
      waiting: waiting.length,
      inProgress: inProgress.length + called.length,
      emergency: emergency.length,
      avgWait,
      processed: entries.filter((e) => e.status === "Completed").length,
    };
  }, [entries]);

  const nextPatient = useMemo(() => {
    return entries
      .filter((e) => e.status === "Waiting" || e.status === "Verifying")
      .sort((a, b) => {
        if (a.priority === "Emergency" && b.priority !== "Emergency") return -1;
        if (b.priority === "Emergency" && a.priority !== "Emergency") return 1;
        if (a.priority === "High" && b.priority === "Normal") return -1;
        if (b.priority === "High" && a.priority === "Normal") return 1;
        return a.waitTimeMinutes - b.waitTimeMinutes;
      })[0] || null;
  }, [entries]);

  const handleAddPatient = () => {
    if (!addForm.patientName.trim()) return;
    addEntry({ ...addForm, assignedDoctor: addForm.assignedDoctor || undefined });
    setAddForm({ patientName: "", queueType: "consultation", priority: "Normal", patientType: "Private", provider: "Self-Pay", station: "Nursing", assignedDoctor: "", reason: "" });
    setShowAddModal(false);
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    addAnnouncement(newAnnouncement.trim());
    setNewAnnouncement("");
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Queue Management</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Add, call, and manage patients across all stations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => setShowPrintModal(true)}
            className="w-full sm:w-auto py-3 px-5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Printer size={16} className="text-slate-400" /> Print Report
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto py-3 px-6 bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20 text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Add Patient
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Active Queue", value: stats.active, icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Avg. Wait Time", value: `${stats.avgWait}m`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In Progress", value: stats.inProgress, icon: Play, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Priority Cases", value: stats.emergency, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            key={stat.label}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3"
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg sm:text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Call Next Patient */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Patient</p>
            <UserCheck size={14} className="text-sky-500" />
          </div>
          {nextPatient ? (
            <>
              <p className="text-sm font-black text-slate-900 truncate mb-2">{nextPatient.patientName}</p>
              <p className="text-[9px] text-slate-400 font-bold mb-3">{nextPatient.ticketNumber} • {getQueueTypeLabel(nextPatient.queueType)} • {nextPatient.waitTime}</p>
<button onClick={() => { setCallEdit({ ...nextPatient }); setShowCallModal(nextPatient); }}
              className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
                <Megaphone size={12} /> Call Now
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No patients waiting</p>
          )}
        </div>

        {/* Manage Stations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stations</p>
            <DoorOpen size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-black text-slate-900">{stations.length}</span>
            <span className="text-[10px] text-slate-400 font-bold">stations total</span>
          </div>
          <button onClick={() => setShowStationsModal(true)}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            <DoorOpen size={12} /> Manage Stations
          </button>
        </div>

        {/* Announcements */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Announcements</p>
            <Megaphone size={14} className="text-amber-500" />
          </div>
          <p className="text-xs text-slate-600 font-medium truncate mb-1">
            {announcements.length > 0 ? announcements[0] : "No announcements"}
          </p>
          <p className="text-[9px] text-slate-400 font-bold mb-3">{announcements.length} active</p>
          <button onClick={() => setShowAnnouncementsModal(true)}
            className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
            <Megaphone size={12} /> Manage
          </button>
        </div>
      </div>

      {/* Main Queue Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Left: Station Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
            {stationFilters.map((s) => (
              <button key={s.id} onClick={() => setActiveStation(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 whitespace-nowrap",
                  activeStation === s.id
                    ? "bg-slate-900 border-slate-900 text-white shadow"
                    : "bg-white border-slate-100 text-slate-600 hover:border-sky-200"
                )}>
                <s.icon size={14} />
                <span className="text-[10px] font-black">{s.label}</span>
              </button>
            ))}
          </div>
          <h2 className="hidden md:block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Queue Types</h2>
          <div className="hidden md:block space-y-2">
            {stationFilters.map((s) => {
              const count = s.id === "all"
                ? entries.filter((e) => e.status !== "Completed" && e.status !== "No Show").length
                : entries.filter((e) => e.queueType === s.id && e.status !== "Completed" && e.status !== "No Show").length;
              return (
                <button key={s.id} onClick={() => setActiveStation(s.id)}
                  className={cn(
                    "w-full p-3 rounded-2xl border transition-all flex items-center justify-between group",
                    activeStation === s.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/15"
                      : "bg-white border-slate-100 text-slate-600 hover:border-sky-200"
                  )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      activeStation === s.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-sky-50"
                    )}>
                      <s.icon size={16} className={activeStation === s.id ? "text-sky-400" : "text-slate-400 group-hover:text-sky-600"} />
                    </div>
                    <span className="text-sm font-black">{s.label}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black",
                    activeStation === s.id ? "bg-sky-500 text-white" : "bg-slate-50 text-slate-400"
                  )}>{count}</span>
                </button>
              );
            })}
          </div>
          {/* Rooms Quick View */}
          <div className="hidden xl:block">
            <button onClick={() => setShowRoomsModal(true)}
              className="w-full p-3 rounded-2xl border border-slate-100 bg-white text-slate-600 hover:border-sky-200 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center">
                  <DoorOpen size={16} className="text-slate-400 group-hover:text-sky-600" />
                </div>
                <span className="text-sm font-black">Doctor Rooms</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-50 text-slate-400">{rooms.length}</span>
            </button>
          </div>
        </div>

        {/* Right: Queue Table */}
        <div className="xl:col-span-3 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find patient by name or ticket ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as QueueStatus | "all")}
                className="flex-1 md:flex-none px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/10">
                <option value="all">All Status</option>
                <option value="Waiting">Waiting</option>
                <option value="Called">Called</option>
                <option value="In Progress">In Progress</option>
                <option value="Verifying">Verifying</option>
                <option value="Completed">Completed</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
                className="flex-1 md:flex-none px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/10">
                <option value="all">All Priority</option>
                <option value="Emergency">Emergency</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {filteredQueue.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow shrink-0">
                      <span className="text-xs font-black">{item.ticketNumber.split("-")[1]}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                        {item.patientName}
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityIndicators[item.priority])} />
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">
                        {getQueueTypeLabel(item.queueType)} &bull; {item.patientType}
                      </p>
                      {item.assignedDoctor && (
                        <p className="text-[8px] text-sky-600 font-bold mt-0.5 truncate">{item.assignedDoctor}</p>
                      )}
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Timer size={11} className={cn(item.waitTimeMinutes > 30 ? "text-rose-500" : "text-amber-500")} />
                      <span className="text-[10px] font-black">{item.waitTime}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">{item.station}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.status !== "Completed" && item.status !== "No Show" && (
                      <>
                        {item.status === "Waiting" || item.status === "Verifying" ? (
                          <button onClick={() => { setCallEdit({ ...item }); setShowCallModal(item); }}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">
                            <Megaphone size={11} />
                          </button>
                        ) : item.status === "Called" ? (
                          <button onClick={() => setShowActionModal({ entry: item, action: "start" })}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <Play size={11} />
                          </button>
                        ) : item.status === "In Progress" ? (
                          <button onClick={() => setShowActionModal({ entry: item, action: "complete" })}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <CheckCircle2 size={11} />
                          </button>
                        ) : null}
                        <button onClick={() => setShowActionModal({ entry: item, action: "remove" })}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredQueue.length === 0 && (
              <div className="p-8 rounded-xl bg-white border border-slate-100 text-center">
                <p className="text-sm text-slate-400 font-medium">No patients in queue</p>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Wait</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0",
                          item.priority === "Emergency" ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
                        )}>
                          <span className="text-[8px] font-black opacity-60 leading-none">#</span>
                          <span className="text-xs font-black leading-none mt-0.5">{item.ticketNumber.split("-")[1]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-black text-[9px] shrink-0">
                            {item.patientName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                              {item.patientName}
                              {item.priority !== "Normal" && (
                                <span className={cn(
                                  "text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full",
                                  item.priority === "Emergency" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                )}>{item.priority}</span>
                              )}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              {item.patientType} &bull; {item.provider}
                            </p>
                            {item.assignedDoctor && (
                              <p className="text-[8px] text-sky-600 font-bold mt-0.5">{item.assignedDoctor}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700">{getQueueTypeLabel(item.queueType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Timer size={12} className={cn(item.waitTimeMinutes > 30 ? "text-rose-500" : "text-amber-500")} />
                          <span className="text-xs font-black">{item.waitTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", getStatusColor(item.status))}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== "Completed" && item.status !== "No Show" && (
                            <>
                              {(item.status === "Waiting" || item.status === "Verifying") && (
                                <button onClick={() => { setCallEdit({ ...item }); setShowCallModal(item); }}
                                  className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors" title="Call Patient">
                                  <Megaphone size={13} />
                                </button>
                              )}
                              {item.status === "Called" && (
                                <button onClick={() => setShowActionModal({ entry: item, action: "start" })}
                                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Start Processing">
                                  <Play size={13} />
                                </button>
                              )}
                              {item.status === "In Progress" && (
                                <button onClick={() => setShowActionModal({ entry: item, action: "complete" })}
                                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Complete">
                                  <CheckCircle2 size={13} />
                                </button>
                              )}
                              <button onClick={() => setShowActionModal({ entry: item, action: "remove" })}
                                className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Remove">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-400 font-medium">No patients in queue</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* Add Patient Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Patient to Queue">
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Patient Name</label>
            <input type="text" value={addForm.patientName} onChange={(e) => setAddForm({ ...addForm, patientName: e.target.value })}
              placeholder="Enter patient name"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Queue Type</label>
              <select value={addForm.queueType} onChange={(e) => setAddForm({ ...addForm, queueType: e.target.value as QueueType })}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
                <option value="consultation">Consultation</option>
                <option value="eye-test">Eye Test</option>
                <option value="optical">Optical</option>
                <option value="lens-pickup">Lens Pickup</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Priority</label>
              <select value={addForm.priority} onChange={(e) => setAddForm({ ...addForm, priority: e.target.value as Priority })}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Patient Type</label>
              <select value={addForm.patientType} onChange={(e) => {
                const newType = e.target.value as PatientType;
                setAddForm({
                  ...addForm,
                  patientType: newType,
                  provider: newType === 'HMO' ? 'Reliance Health' : 'Self-Pay',
                });
              }}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
                <option value="Private">Private</option>
                <option value="HMO">HMO</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Provider</label>
              <select value={addForm.provider} onChange={(e) => setAddForm({ ...addForm, provider: e.target.value })}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
                {addForm.patientType === 'Private' ? (
                  <>
                    <option value="Self-Pay">Self-Pay</option>
                    <option value="Cash">Cash</option>
                    <option value="Insurance">Insurance</option>
                  </>
                ) : (
                  <>
                    <option value="Reliance Health">Reliance Health</option>
                    <option value="AXA Mansard">AXA Mansard</option>
                    <option value="Hygeia HMO">Hygeia HMO</option>
                    <option value="NHIA">NHIA</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Reason for Visit</label>
            <input type="text" value={addForm.reason} onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
              placeholder="e.g. Eye irritation, routine checkup, cataract review"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300" />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Assign Doctor</label>
            <select value={addForm.assignedDoctor} onChange={(e) => setAddForm({ ...addForm, assignedDoctor: e.target.value })}
              className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
              <option value="">— Select doctor —</option>
              {doctors.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
              {doctors.length === 0 && <option value="" disabled>No doctors available</option>}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleAddPatient}
              className="flex-1 py-3 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add to Queue
            </button>
          </div>
        </div>
      </Modal>

      {/* Call Patient Modal — Editable Summary */}
      <Modal isOpen={!!showCallModal} onClose={() => { setShowCallModal(null); setCallEdit(null); }} title="Patient Summary">
        {callEdit && (
          <div className="space-y-3">
            {/* Compact Header */}
            <div className={cn("p-3 rounded-xl border flex items-center gap-3",
              callEdit.priority === 'Emergency' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'
            )}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                callEdit.priority === 'Emergency' ? 'bg-rose-100' : 'bg-slate-100'
              )}>
                <Users size={18} className={callEdit.priority === 'Emergency' ? 'text-rose-600' : 'text-slate-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 truncate">{callEdit.patientName}</h4>
                  {callEdit.priority !== 'Normal' && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0",
                      callEdit.priority === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    )}>{callEdit.priority}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-bold">{callEdit.ticketNumber} &bull; {callEdit.waitTime} &bull; {callEdit.checkInTime}</p>
              </div>
            </div>

            {/* Editable Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Patient Type</label>
                <select value={callEdit.patientType} onChange={(e) => setCallEdit({ ...callEdit, patientType: e.target.value as PatientType })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  <option value="Private">Private</option>
                  <option value="HMO">HMO</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Provider</label>
                <select value={callEdit.provider} onChange={(e) => setCallEdit({ ...callEdit, provider: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  {callEdit.patientType === 'Private' ? (
                    <><option value="Self-Pay">Self-Pay</option><option value="Cash">Cash</option><option value="Insurance">Insurance</option></>
                  ) : (
                    <><option value="Reliance Health">Reliance Health</option><option value="AXA Mansard">AXA Mansard</option><option value="Hygeia HMO">Hygeia HMO</option><option value="NHIA">NHIA</option></>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Queue Type</label>
                <select value={callEdit.queueType} onChange={(e) => setCallEdit({ ...callEdit, queueType: e.target.value as QueueType })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  <option value="consultation">Consultation</option>
                  <option value="eye-test">Eye Test</option>
                  <option value="optical">Optical</option>
                  <option value="lens-pickup">Lens Pickup</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Station</label>
                <select value={callEdit.station} onChange={(e) => setCallEdit({ ...callEdit, station: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  {stations.filter((s) => s.isActive).map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason + Doctor */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Reason for Visit</label>
                <input type="text" value={callEdit.reason || ''} onChange={(e) => setCallEdit({ ...callEdit, reason: e.target.value })}
                  placeholder="e.g. Eye irritation"
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Doctor in Charge</label>
                <select value={callEdit.assignedDoctor || ''} onChange={(e) => setCallEdit({ ...callEdit, assignedDoctor: e.target.value || undefined })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  <option value="">— Select —</option>
                  {doctors.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => { updateEntry(callEdit.id, { patientType: callEdit.patientType, provider: callEdit.provider, queueType: callEdit.queueType, station: callEdit.station, reason: callEdit.reason, assignedDoctor: callEdit.assignedDoctor }); callPatient(callEdit.id); setShowCallModal(null); setCallEdit(null); }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-1.5">
                <Megaphone size={12} /> Call Patient
              </button>
              <button onClick={() => { setShowCallModal(null); setCallEdit(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Start / Complete / Remove) */}
      <Modal isOpen={!!showActionModal} onClose={() => setShowActionModal(null)}
        title={showActionModal?.action === "start" ? "Start Processing" : showActionModal?.action === "complete" ? "Complete Visit" : "Remove from Queue"}>
        {showActionModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                {showActionModal.entry.ticketNumber.split("-")[1]}
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">{showActionModal.entry.patientName}</h4>
                <p className="text-xs text-slate-500">{showActionModal.entry.station} &bull; {showActionModal.entry.waitTime}</p>
              </div>
            </div>
            {showActionModal.action === "start" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">Begin processing at <strong>{showActionModal.entry.station}</strong>? This will update the public display.</p>
                <button onClick={() => { updateStatus(showActionModal.entry.id, "In Progress"); setShowActionModal(null); }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <Play size={14} /> Start & Mark In Progress
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              </div>
            )}
            {showActionModal.action === "complete" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">Mark <strong>{showActionModal.entry.patientName}</strong> as completed?</p>
                <button onClick={() => { updateStatus(showActionModal.entry.id, "Completed"); setShowActionModal(null); }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Mark Completed
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              </div>
            )}
            {showActionModal.action === "remove" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">Remove <strong>{showActionModal.entry.patientName}</strong> from the queue?</p>
                <button onClick={() => { removeEntry(showActionModal.entry.id); setShowActionModal(null); }}
                  className="w-full py-3 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Remove from Queue
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Keep in Queue</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Manage Stations Modal */}
      <Modal isOpen={showStationsModal} onClose={() => setShowStationsModal(false)} title="Manage Stations">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {stations.map((s) => {
            const stationQueue = entries.filter((e) => e.station === s.name && e.status !== "Completed" && e.status !== "No Show").length;
            return (
              <div key={s.id} className="px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    s.isActive ? "bg-emerald-50" : "bg-slate-100"
                  )}>
                    <DoorOpen size={14} className={s.isActive ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{s.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold">
                      {s.doctorName || "Unassigned"} &bull; {stationQueue} in queue
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shrink-0",
                  s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {s.isActive ? "Active" : "Off"}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowStationsModal(false)}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 mt-3">
          Close
        </button>
      </Modal>

      {/* Manage Rooms Modal */}
      <Modal isOpen={showRoomsModal} onClose={() => setShowRoomsModal(false)} title="Doctor Rooms">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {rooms.map((room) => {
            const statusColors = {
              available: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", btn: "bg-emerald-600 hover:bg-emerald-700 text-white" },
              occupied: { bg: "bg-sky-50 border-sky-100", text: "text-sky-700", dot: "bg-sky-500 animate-pulse", btn: "bg-sky-600 hover:bg-sky-700 text-white" },
              break: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500", btn: "bg-amber-600 hover:bg-amber-700 text-white" },
              offline: { bg: "bg-slate-100 border-slate-200", text: "text-slate-500", dot: "bg-slate-400", btn: "bg-slate-600 hover:bg-slate-700 text-white" },
            };
            const cfg = statusColors[room.status];
            const statuses: RoomStatus['status'][] = ['available', 'occupied', 'break', 'offline'];
            return (
              <div key={room.roomId} className={cn("p-3 rounded-xl border flex items-center justify-between gap-3", cfg.bg)}>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900">{room.roomName}</p>
                  <p className="text-[8px] text-slate-500 font-bold">{room.doctorName} &bull; {room.queueCount} waiting</p>
                  {room.currentPatient && (
                    <p className="text-[8px] text-sky-600 font-bold mt-0.5">Currently: {room.currentPatient}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {statuses.map((s) => {
                    const labels: Record<RoomStatus['status'], string> = {
                      available: "Available",
                      occupied: "Occupied",
                      break: "On Break",
                      offline: "Offline",
                    };
                    return (
                      <button
                        key={s}
                        onClick={() => updateRoomStatus(room.roomId, s)}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all group/tooltip relative",
                          room.status === s
                            ? "bg-slate-900 text-white shadow"
                            : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        )}
                        title={labels[s]}
                      >
                        {s === "available" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        {s === "occupied" && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                        {s === "break" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                        {s === "offline" && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-900 text-white text-[8px] font-bold whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                          {labels[s]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowRoomsModal(false)}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 mt-3">
          Close
        </button>
      </Modal>

      {/* Manage Announcements Modal */}
      <Modal isOpen={showAnnouncementsModal} onClose={() => setShowAnnouncementsModal(false)} title="Manage Announcements">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Type a new announcement..."
              onKeyDown={(e) => e.key === "Enter" && handleAddAnnouncement()}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300" />
            <button onClick={handleAddAnnouncement}
              className="px-4 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {announcements.map((a, i) => (
              <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Megaphone size={14} className="text-amber-600 shrink-0" />
                  <p className="text-sm font-medium text-slate-700 truncate">{a}</p>
                </div>
                <button onClick={() => removeAnnouncement(i)}
                  className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 shrink-0 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-400 font-medium">No announcements</p>
              </div>
            )}
          </div>
          <button onClick={() => setShowAnnouncementsModal(false)}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
            Close
          </button>
        </div>
      </Modal>

      {/* Print Report Modal */}
      <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Queue Report">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Queue status report for today:</p>
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div><p className="text-[9px] font-black text-slate-400 uppercase">Total Patients</p><p className="text-lg font-black text-slate-900">{entries.length}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">In Progress</p><p className="text-lg font-black text-slate-900">{stats.inProgress}</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">Avg Wait</p><p className="text-lg font-black text-slate-900">{stats.avgWait}m</p></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">Processed</p><p className="text-lg font-black text-slate-900">{stats.processed}</p></div>
          </div>
          <button onClick={() => { window.print(); setShowPrintModal(false); }}
            className="w-full py-3 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
            <Printer size={14} /> Print Report
          </button>
        </div>
      </Modal>
    </div>
  );
}
