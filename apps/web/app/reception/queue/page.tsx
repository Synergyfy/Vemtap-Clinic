"use client";

import React, { useState, useMemo } from "react";
import {
  Clock, Users, Search,
  UserCheck, Stethoscope, Activity,
  AlertCircle, Timer, X, Play, CheckCircle2, Monitor,
  Plus, Trash2, Megaphone, DoorOpen, Eye, Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import {
  useQueue,
  useQueueStats,
  useQueueAnnouncements,
  useCreateQueueEntry,
  useUpdateQueueEntry,
  useCompleteQueueEntry,
  useCancelQueueEntry,
  useCallNext,
  useCreateAnnouncement,
  QueueEntry,
  QueueQueryParams,
  CreateQueueEntryData,
  QueueStatus,
  Priority,
  PatientType
} from "@/hooks/useQueue";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const stationFilters = [
  { id: "all", label: "All Stations", icon: Monitor },
  { id: "consultation", label: "Consultation", icon: Stethoscope },
  { id: "eye_test", label: "Eye Test", icon: Eye },
  { id: "optical", label: "Optical", icon: Eye },
  { id: "pharmacy", label: "Pharmacy", icon: Activity },
  { id: "emergency", label: "Emergency", icon: AlertCircle },
];

const priorityIndicators: Record<string, string> = {
  Emergency: "bg-rose-500",
  High: "bg-amber-500",
  Normal: "bg-slate-300",
};

const statusStyles: Record<string, string> = {
  waiting: "bg-slate-100 text-slate-600",
  called: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-500",
};

function getStationLabel(station: string | undefined): string {
  if (!station) return "Unassigned";
  const labels: Record<string, string> = {
    consultation: "Consultation",
    eye_test: "Eye Test",
    optical: "Optical",
    lens_pickup: "Lens Pickup",
    pharmacy: "Pharmacy",
    emergency: "Emergency",
  };
  return labels[station] || station;
}

function getStatusColor(status: string): string {
  return statusStyles[status] || "bg-slate-100 text-slate-600";
}

function computeWaitMinutes(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getPatientName(patient: QueueEntry["patient"]): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

function getPatientTypeLabel(patientType: string | undefined): string {
  return patientType?.toLowerCase() === "hmo" ? "HMO" : "Private";
}

function getHmoName(hmoName: string | undefined): string {
  return hmoName || "Self-Pay";
}

export default function QueuePage() {
  const { user } = useAuth();

  const [activeStation, setActiveStation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const queryParams: QueueQueryParams = {
    clinicId: user?.clinicId,
    station: activeStation === "all" ? undefined : activeStation,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: 1,
    limit: 100,
  };

  const { data: queueResponse, isLoading: isQueueLoading, refetch: refetchQueue } = useQueue(queryParams);
  const { data: statsResponse } = useQueueStats(user?.clinicId || null);
  const { data: announcementsResponse } = useQueueAnnouncements(user?.clinicId || null);

  const createQueueEntryMutation = useCreateQueueEntry();
  const updateQueueEntryMutation = useUpdateQueueEntry();
  const completeQueueEntryMutation = useCompleteQueueEntry();
  const cancelQueueEntryMutation = useCancelQueueEntry();
  const createAnnouncementMutation = useCreateAnnouncement();

  const entries = queueResponse?.data || [];
  const announcements = announcementsResponse || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState<QueueEntry | null>(null);
  const [callEdit, setCallEdit] = useState<{ station: string; notes: string }>({ station: "consultation", notes: "" });
  const [showActionModal, setShowActionModal] = useState<{ entry: QueueEntry; action: "start" | "complete" | "remove" } | null>(null);
  const [showStationsModal, setShowStationsModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [addForm, setAddForm] = useState({
    patientName: "",
    station: "consultation" as string,
    priority: "Normal" as Priority,
    notes: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState("");

  const filteredQueue = useMemo(() => {
    return entries.filter((e) => {
      if (activeStation !== "all" && e.station !== activeStation) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (priorityFilter !== "all" && e.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = getPatientName(e.patient);
        return (
          name.toLowerCase().includes(q) ||
          e.ticketNumber.toString().includes(q)
        );
      }
      return true;
    });
  }, [entries, activeStation, statusFilter, priorityFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = entries.filter((e) => e.status !== "completed" && e.status !== "cancelled");
    const waiting = active.filter((e) => e.status === "waiting");
    const inProgress = active.filter((e) => e.status === "in_progress");
    const emergency = active.filter((e) => e.priority?.toLowerCase() === "emergency");
    const avgWait = waiting.length
      ? Math.round(waiting.reduce((s, e) => s + computeWaitMinutes(e.createdAt), 0) / waiting.length)
      : 0;
    return {
      active: active.length,
      waiting: waiting.length,
      inProgress: inProgress.length,
      emergency: emergency.length,
      avgWait,
      processed: entries.filter((e) => e.status === "completed").length,
    };
  }, [entries]);

  const nextPatient = useMemo(() => {
    return entries
      .filter((e) => e.status === "waiting")
      .sort((a, b) => {
        if (a.priority?.toLowerCase() === "emergency" && b.priority?.toLowerCase() !== "emergency") return -1;
        if (b.priority?.toLowerCase() === "emergency" && a.priority?.toLowerCase() !== "emergency") return 1;
        if (a.priority?.toLowerCase() === "high" && b.priority?.toLowerCase() === "normal") return -1;
        if (b.priority?.toLowerCase() === "high" && a.priority?.toLowerCase() === "normal") return 1;
        return computeWaitMinutes(a.createdAt) - computeWaitMinutes(b.createdAt);
      })[0] || null;
  }, [entries]);

  const tableRows = useMemo(() => {
    if (filteredQueue.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">No patients in queue</p>
          </td>
        </tr>
      );
    }
    return filteredQueue.map((item) => {
      const patientName = getPatientName(item.patient);
      const patientType = getPatientTypeLabel(item.patient?.patientType);
      const hmoName = getHmoName(item.patient?.hmoName);
      const waitMins = computeWaitMinutes(item.createdAt);
      const priorityColor = item.priority?.toLowerCase() === "emergency" ? "bg-rose-500 text-white" : "bg-slate-900 text-white";

      return (
        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
          <td className="px-6 py-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0",
              priorityColor
            )}>
              <span className="text-[8px] font-black opacity-60 leading-none">#</span>
              <span className="text-xs font-black leading-none mt-0.5">{item.ticketNumber}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-black text-[9px] shrink-0">
                {item.patient?.firstName ? `${item.patient.firstName[0]}${item.patient.lastName?.[0] || ""}` : "?"}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                  {patientName}
                  {item.priority?.toLowerCase() !== "normal" && item.priority && (
                    <span className={cn(
                      "text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full",
                      item.priority.toLowerCase() === "emergency" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>{item.priority}</span>
                  )}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                  {patientType} &bull; {hmoName}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className="text-xs font-bold text-slate-700">{getStationLabel(item.station)}</span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1 text-slate-500">
              <Timer size={12} className={cn(waitMins > 60 ? "text-rose-500" : "text-amber-500")} />
              <span className="text-xs font-black">{formatWaitTime(waitMins)}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", getStatusColor(item.status))}>
              {item.status}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              {item.status === "waiting" && (
                <button onClick={() => { setCallEdit({ station: item.station || "consultation", notes: item.notes || "" }); setShowCallModal(item); }}
                  className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors" title="Call Patient">
                  <Megaphone size={13} />
                </button>
              )}
              {item.status === "in_progress" && (
                <button onClick={() => setShowActionModal({ entry: item, action: "complete" })}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Complete">
                  <CheckCircle2 size={13} />
                </button>
              )}
              {(item.status === "waiting" || item.status === "in_progress") && (
                <button onClick={() => setShowActionModal({ entry: item, action: "remove" })}
                  className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Remove">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    });
  }, [filteredQueue]);

  const handleAddPatient = async () => {
    if (!addForm.patientName.trim() || !user) return;
    try {
      const patientId = "temp-patient-id";
      await createQueueEntryMutation.mutateAsync({
        patientId,
        branchId: user.clinicId,
        clinicId: user.clinicId,
        station: addForm.station,
        priority: addForm.priority,
        notes: addForm.notes,
      });
      toast.success("Patient added to queue");
      setAddForm({ patientName: "", station: "consultation", priority: "Normal", notes: "" });
      setShowAddModal(false);
      refetchQueue();
    } catch (error) {
      toast.error("Failed to add patient to queue");
      console.error("Add patient error:", error);
    }
  };

  const handleCallPatient = async () => {
    if (!showCallModal) return;
    try {
      await updateQueueEntryMutation.mutateAsync({
        id: showCallModal.id,
        data: {
          station: callEdit.station,
          notes: callEdit.notes,
        },
      });
      toast.success("Patient called");
      setShowCallModal(null);
      refetchQueue();
    } catch (error) {
      toast.error("Failed to call patient");
      console.error("Call patient error:", error);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim() || !user) return;
    try {
      await createAnnouncementMutation.mutateAsync({
        message: newAnnouncement.trim(),
        clinicId: user.clinicId,
        staffId: user.userId,
      });
      toast.success("Announcement created");
      setNewAnnouncement("");
    } catch (error) {
      toast.error("Failed to create announcement");
      console.error("Add announcement error:", error);
    }
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
              <p className="text-sm font-black text-slate-900 truncate mb-2">
                {getPatientName(nextPatient.patient)}
              </p>
              <p className="text-[9px] text-slate-400 font-bold mb-3">
                #{nextPatient.ticketNumber} &bull; {getStationLabel(nextPatient.station)} &bull; {formatWaitTime(computeWaitMinutes(nextPatient.createdAt))}
              </p>
              <button onClick={() => { setCallEdit({ station: nextPatient.station || "consultation", notes: nextPatient.notes || "" }); setShowCallModal(nextPatient); }}
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
            <span className="text-2xl font-black text-slate-900">
              {[...new Set(entries.map((e) => e.station).filter(Boolean))].length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">stations active</span>
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
            {announcements.length > 0 ? announcements[0].message : "No announcements"}
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
                ? entries.filter((e) => e.status !== "completed" && e.status !== "cancelled").length
                : entries.filter((e) => e.station === s.id && e.status !== "completed" && e.status !== "cancelled").length;
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
                <option value="waiting">Waiting</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
            {filteredQueue.map((item) => {
              const patientName = getPatientName(item.patient);
              const hmoName = getHmoName(item.patient?.hmoName);
              const waitMins = computeWaitMinutes(item.createdAt);

              return (
                <div key={item.id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow shrink-0">
                        <span className="text-xs font-black">{item.ticketNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                          {patientName}
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityIndicators[item.priority || "Normal"] || "bg-slate-300")} />
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">
                          {getStationLabel(item.station)} &bull; {hmoName}
                        </p>
                      </div>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", getStatusColor(item.status))}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Timer size={11} className={cn(waitMins > 60 ? "text-rose-500" : "text-amber-500")} />
                        <span className="text-[10px] font-black">{formatWaitTime(waitMins)}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-700">{item.station || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.status === "waiting" && (
                        <button onClick={() => { setCallEdit({ station: item.station || "consultation", notes: item.notes || "" }); setShowCallModal(item); }}
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">
                          <Megaphone size={11} />
                        </button>
                      )}
                      {item.status === "in_progress" && (
                        <button onClick={() => setShowActionModal({ entry: item, action: "complete" })}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 size={11} />
                        </button>
                      )}
                      {(item.status === "waiting" || item.status === "in_progress") && (
                        <button onClick={() => setShowActionModal({ entry: item, action: "remove" })}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Station</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Wait</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tableRows}
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
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Station</label>
              <select value={addForm.station} onChange={(e) => setAddForm({ ...addForm, station: e.target.value })}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300">
                {stationFilters.filter((s) => s.id !== "all").map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
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
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Notes</label>
            <input type="text" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="e.g. Eye irritation, routine checkup"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300" />
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

      {/* Call Patient Modal */}
      <Modal isOpen={!!showCallModal} onClose={() => { setShowCallModal(null); }} title="Call Patient">
        {showCallModal && (
          <div className="space-y-3">
            <div className={cn("p-3 rounded-xl border flex items-center gap-3",
              showCallModal.priority?.toLowerCase() === "emergency" ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"
            )}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                showCallModal.priority?.toLowerCase() === "emergency" ? "bg-rose-100" : "bg-slate-100"
              )}>
                <Users size={18} className={showCallModal.priority?.toLowerCase() === "emergency" ? "text-rose-600" : "text-slate-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {getPatientName(showCallModal.patient)}
                  </h4>
                  {showCallModal.priority?.toLowerCase() !== "normal" && showCallModal.priority && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0",
                      showCallModal.priority.toLowerCase() === "emergency" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>{showCallModal.priority}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-bold">
                  #{showCallModal.ticketNumber} &bull; {formatWaitTime(computeWaitMinutes(showCallModal.createdAt))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Patient Type</label>
                <div className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900">
                  {getPatientTypeLabel(showCallModal.patient?.patientType)}
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Provider</label>
                <div className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900">
                  {getHmoName(showCallModal.patient?.hmoName)}
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Station</label>
                <select value={callEdit.station} onChange={(e) => setCallEdit({ ...callEdit, station: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  {stationFilters.filter((s) => s.id !== "all").map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Priority</label>
                <div className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-900">
                  {showCallModal.priority || "Normal"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Notes</label>
              <input type="text" value={callEdit.notes} onChange={(e) => setCallEdit({ ...callEdit, notes: e.target.value })}
                placeholder="e.g. Eye irritation"
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300" />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleCallPatient}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-1.5">
                <Megaphone size={12} /> Call Patient
              </button>
              <button onClick={() => setShowCallModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Complete / Remove) */}
      <Modal isOpen={!!showActionModal} onClose={() => setShowActionModal(null)}
        title={showActionModal?.action === "complete" ? "Complete Visit" : "Remove from Queue"}>
        {showActionModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                {showActionModal.entry.ticketNumber}
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {getPatientName(showActionModal.entry.patient)}
                </h4>
                <p className="text-xs text-slate-500">
                  {getStationLabel(showActionModal.entry.station)} &bull; {formatWaitTime(computeWaitMinutes(showActionModal.entry.createdAt))}
                </p>
              </div>
            </div>
            {showActionModal.action === "complete" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">
                  Mark <strong>{getPatientName(showActionModal.entry.patient)}</strong> as completed?
                </p>
                <button onClick={() => { completeQueueEntryMutation.mutate(showActionModal.entry.id); setShowActionModal(null); }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Mark Completed
                </button>
                <button onClick={() => setShowActionModal(null)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              </div>
            )}
            {showActionModal.action === "remove" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">
                  Remove <strong>{getPatientName(showActionModal.entry.patient)}</strong> from the queue?
                </p>
                <button onClick={() => { cancelQueueEntryMutation.mutate(showActionModal.entry.id); setShowActionModal(null); }}
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
          {(() => {
            const stationNames = [...new Set(entries.map((e) => e.station).filter(Boolean))];
            return stationNames.map((stationName) => {
              const stationQueue = entries.filter((e) => e.station === stationName && e.status !== "completed" && e.status !== "cancelled").length;
              return (
                <div key={stationName} className="px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                      <DoorOpen size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{getStationLabel(stationName)}</p>
                      <p className="text-[8px] text-slate-400 font-bold">{stationQueue} in queue</p>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shrink-0 bg-emerald-100 text-emerald-700">
                    Active
                  </div>
                </div>
              );
            });
          })()}
        </div>
        <button onClick={() => setShowStationsModal(false)}
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
            {announcements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Megaphone size={14} className="text-amber-600 shrink-0" />
                  <p className="text-sm font-medium text-slate-700 truncate">{a.message}</p>
                </div>
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
