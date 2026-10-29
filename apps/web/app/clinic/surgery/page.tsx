"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import {
  useProcedures,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useSchedules,
  useSurgeryStats,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  type SurgicalProcedure,
  type OperatingRoom,
  type SurgerySchedule,
  type ProcedureCategory,
  type RoomStatus,
  type SurgeryStatus,
} from "@/hooks/useSurgery";
import { usePatients } from "@/hooks/usePatients";
import { useStaff } from "@/hooks/useStaff";
import {
  Activity, Calendar, Clock, Plus, Search, Filter,
  CheckCircle2, AlertCircle, XCircle, Trash2, Edit3,
  User, Building2, ShieldCheck, Scissors, Eye,
  Play, Check, Ban, AlertTriangle, ChevronRight, Stethoscope
} from "lucide-react";

const PROCEDURE_CATEGORIES: { value: ProcedureCategory; label: string }[] = [
  { value: "cataract", label: "Cataract" },
  { value: "glaucoma", label: "Glaucoma" },
  { value: "refractive", label: "Refractive" },
  { value: "corneal", label: "Corneal" },
  { value: "retinal", label: "Retinal" },
  { value: "oculoplastic", label: "Oculoplastic" },
  { value: "pediatric", label: "Pediatric" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

const ROOM_STATUS_MAP: Record<RoomStatus, { label: string; bg: string; text: string; border: string }> = {
  available: { label: "Available", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  occupied: { label: "In Surgery", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  maintenance: { label: "Maintenance", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  cleaning: { label: "Sanitizing", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
};

const SURGERY_STATUS_MAP: Record<SurgeryStatus, { label: string; bg: string; text: string }> = {
  scheduled: { label: "Scheduled", bg: "bg-sky-50 text-sky-700 border-sky-200", text: "text-sky-700" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700" },
  completed: { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700" },
  cancelled: { label: "Cancelled", bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-700" },
  postponed: { label: "Postponed", bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700" },
};

type ActiveTab = "schedules" | "procedures" | "rooms";

export default function SurgeryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("schedules");

  // Queries
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: procedures = [], isLoading: proceduresLoading } = useProcedures();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: stats } = useSurgeryStats();
  const { data: patientsData } = usePatients({ clinicId: user?.clinicId, limit: 100 });
  const patientsList = Array.isArray(patientsData?.data) ? patientsData.data : Array.isArray(patientsData) ? patientsData : [];
  const { data: staffData } = useStaff({ clinicId: user?.clinicId, limit: 100 });
  const staffList = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];

  // Mutations
  const createScheduleMut = useCreateSchedule();
  const updateScheduleMut = useUpdateSchedule();
  const deleteScheduleMut = useDeleteSchedule();
  const createProcedureMut = useCreateProcedure();
  const updateProcedureMut = useUpdateProcedure();
  const deleteProcedureMut = useDeleteProcedure();
  const createRoomMut = useCreateRoom();
  const updateRoomMut = useUpdateRoom();
  const deleteRoomMut = useDeleteRoom();

  // Filters
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [procedureCategoryFilter, setProcedureCategoryFilter] = useState<string>("all");

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SurgerySchedule | null>(null);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<SurgicalProcedure | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<OperatingRoom | null>(null);

  // Form States - Schedule
  const [scheduleForm, setScheduleForm] = useState({
    procedureId: "",
    operatingRoomId: "",
    patientId: "",
    primarySurgeonId: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    preoperativeNotes: "",
  });

  // Form States - Procedure
  const [procedureForm, setProcedureForm] = useState<{
    name: string;
    description: string;
    category: ProcedureCategory;
    estimatedDurationMinutes: number;
    requiredEquipment: string;
    preOpRequirements: string;
    postOpInstructions: string;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    category: "cataract",
    estimatedDurationMinutes: 30,
    requiredEquipment: "",
    preOpRequirements: "",
    postOpInstructions: "",
    isActive: true,
  });

  // Form States - Room
  const [roomForm, setRoomForm] = useState<{
    name: string;
    description: string;
    status: RoomStatus;
    equipment: string;
    capacity: number;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    status: "available",
    equipment: "",
    capacity: 1,
    isActive: true,
  });

  // Modal State for Schedule Status Update
  const [statusUpdateNotes, setStatusUpdateNotes] = useState({
    status: "scheduled" as SurgeryStatus,
    intraoperativeNotes: "",
    postoperativeNotes: "",
    complications: "",
    cancellationReason: "",
  });

  // Filtered lists
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchStatus = scheduleStatusFilter === "all" || s.status === scheduleStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.surgeryNumber.toLowerCase().includes(q) ||
        (s.patient && `${s.patient.firstName} ${s.patient.lastName}`.toLowerCase().includes(q)) ||
        (s.procedure && s.procedure.name.toLowerCase().includes(q)) ||
        (s.operatingRoom && s.operatingRoom.name.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [schedules, scheduleStatusFilter, searchQuery]);

  const filteredProcedures = useMemo(() => {
    return procedures.filter((p) => {
      const matchCat = procedureCategoryFilter === "all" || p.category === procedureCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [procedures, procedureCategoryFilter, searchQuery]);

  // Handlers
  const handleOpenScheduleModal = () => {
    const now = new Date();
    const startIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const endIso = new Date(now.getTime() + 120 * 60 * 1000).toISOString().slice(0, 16);
    setScheduleForm({
      procedureId: procedures[0]?.id || "",
      operatingRoomId: rooms[0]?.id || "",
      patientId: patientsList[0]?.id || "",
      primarySurgeonId: staffList[0]?.id || "",
      scheduledStartTime: startIso,
      scheduledEndTime: endIso,
      preoperativeNotes: "",
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.procedureId || !scheduleForm.operatingRoomId || !scheduleForm.patientId || !scheduleForm.primarySurgeonId) {
      alert("Please fill in all required scheduling fields");
      return;
    }
    try {
      await createScheduleMut.mutateAsync({
        procedureId: scheduleForm.procedureId,
        operatingRoomId: scheduleForm.operatingRoomId,
        patientId: scheduleForm.patientId,
        primarySurgeonId: scheduleForm.primarySurgeonId,
        scheduledStartTime: new Date(scheduleForm.scheduledStartTime).toISOString(),
        scheduledEndTime: scheduleForm.scheduledEndTime ? new Date(scheduleForm.scheduledEndTime).toISOString() : undefined,
        preoperativeNotes: scheduleForm.preoperativeNotes.trim() || undefined,
      });
      setShowScheduleModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to schedule surgery");
    }
  };

  const handleUpdateScheduleStatus = async () => {
    if (!selectedSchedule) return;
    try {
      await updateScheduleMut.mutateAsync({
        id: selectedSchedule.id,
        dto: {
          status: statusUpdateNotes.status,
          intraoperativeNotes: statusUpdateNotes.intraoperativeNotes.trim() || undefined,
          postoperativeNotes: statusUpdateNotes.postoperativeNotes.trim() || undefined,
          complications: statusUpdateNotes.complications.trim() || undefined,
          cancellationReason: statusUpdateNotes.cancellationReason.trim() || undefined,
        },
      });
      setSelectedSchedule(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update surgery schedule");
    }
  };

  const handleSaveProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureForm.name.trim()) return;
    try {
      const payload = {
        name: procedureForm.name.trim(),
        description: procedureForm.description.trim() || undefined,
        category: procedureForm.category,
        estimatedDurationMinutes: Number(procedureForm.estimatedDurationMinutes) || 30,
        requiredEquipment: procedureForm.requiredEquipment ? procedureForm.requiredEquipment.split(",").map((s) => s.trim()) : [],
        preOpRequirements: procedureForm.preOpRequirements ? procedureForm.preOpRequirements.split(",").map((s) => s.trim()) : [],
        postOpInstructions: procedureForm.postOpInstructions ? procedureForm.postOpInstructions.split(",").map((s) => s.trim()) : [],
        isActive: procedureForm.isActive,
      };

      if (editingProcedure) {
        await updateProcedureMut.mutateAsync({ id: editingProcedure.id, dto: payload });
        setEditingProcedure(null);
      } else {
        await createProcedureMut.mutateAsync(payload);
        setShowProcedureModal(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to save procedure");
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;
    try {
      const payload = {
        name: roomForm.name.trim(),
        description: roomForm.description.trim() || undefined,
        status: roomForm.status,
        capacity: Number(roomForm.capacity) || 1,
        equipment: roomForm.equipment ? roomForm.equipment.split(",").map((s) => s.trim()) : [],
        isActive: roomForm.isActive,
      };

      if (editingRoom) {
        await updateRoomMut.mutateAsync({ id: editingRoom.id, dto: payload });
        setEditingRoom(null);
      } else {
        await createRoomMut.mutateAsync(payload);
        setShowRoomModal(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to save room");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Surgery & Theater Suite</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Theater booking, surgical procedures, and operating room management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "schedules" && (
            <button
              onClick={handleOpenScheduleModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Schedule Surgery
            </button>
          )}
          {activeTab === "procedures" && (
            <button
              onClick={() => {
                setEditingProcedure(null);
                setProcedureForm({
                  name: "",
                  description: "",
                  category: "cataract",
                  estimatedDurationMinutes: 30,
                  requiredEquipment: "",
                  preOpRequirements: "",
                  postOpInstructions: "",
                  isActive: true,
                });
                setShowProcedureModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> New Procedure
            </button>
          )}
          {activeTab === "rooms" && (
            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomForm({
                  name: "",
                  description: "",
                  status: "available",
                  equipment: "",
                  capacity: 1,
                  isActive: true,
                });
                setShowRoomModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> New Room
            </button>
          )}
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Surgeries", value: stats?.total ?? schedules.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Upcoming Surgeries", value: stats?.upcoming ?? schedules.filter((s) => s.status === "scheduled" || s.status === "confirmed").length, icon: Calendar, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Operating Rooms", value: rooms.length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Procedures", value: procedures.filter((p) => p.isActive).length, icon: Scissors, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", item.bg, item.color)}>
              <item.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        {[
          { id: "schedules", label: "Theater Schedule", count: schedules.length },
          { id: "procedures", label: "Procedures Catalog", count: procedures.length },
          { id: "rooms", label: "Operating Rooms", count: rooms.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ActiveTab);
              setSearchQuery("");
            }}
            className={cn(
              "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold tabular-nums", activeTab === tab.id ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: THEATER SCHEDULE ─── */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by surgery number, patient, procedure, room..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={scheduleStatusFilter}
                onChange={(e) => setScheduleStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
          </div>

          {schedulesLoading ? (
            <div className="p-12 text-center text-slate-400">Loading surgical theater schedule...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 space-y-3">
              <Activity size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No scheduled surgeries found</p>
              <button
                onClick={handleOpenScheduleModal}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100"
              >
                + Schedule First Surgery
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Surgery #</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Procedure & Category</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operating Room</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Surgeon</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule Time</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSchedules.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-black text-slate-900">{item.surgeryNumber}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : "Patient"}
                          </p>
                          {item.patient?.phone && (
                            <p className="text-[10px] text-slate-400">{item.patient.phone}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{item.procedure?.name || "Procedure"}</p>
                          {item.procedure?.category && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                              {item.procedure.category}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {item.operatingRoom?.name || "OR"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700">
                          {item.primarySurgeon ? `Dr. ${item.primarySurgeon.firstName} ${item.primarySurgeon.lastName}` : "Surgeon"}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {new Date(item.scheduledStartTime).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(item.scheduledStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {item.scheduledEndTime ? ` - ${new Date(item.scheduledEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border", SURGERY_STATUS_MAP[item.status]?.bg || "bg-slate-100")}>
                            {SURGERY_STATUS_MAP[item.status]?.label || item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedSchedule(item);
                                setStatusUpdateNotes({
                                  status: item.status,
                                  intraoperativeNotes: item.intraoperativeNotes || "",
                                  postoperativeNotes: item.postoperativeNotes || "",
                                  complications: item.complications || "",
                                  cancellationReason: item.cancellationReason || "",
                                });
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Update Status & Clinical Notes"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete surgery record ${item.surgeryNumber}?`)) {
                                  deleteScheduleMut.mutate(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Surgery"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PROCEDURES CATALOG ─── */}
      {activeTab === "procedures" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surgical procedures..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>
            <select
              value={procedureCategoryFilter}
              onChange={(e) => setProcedureCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {PROCEDURE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProcedures.map((proc) => (
              <div key={proc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {proc.category}
                    </span>
                    <span className={cn("text-[10px] font-bold", proc.isActive ? "text-emerald-600" : "text-slate-400")}>
                      {proc.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{proc.name}</h3>
                  {proc.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proc.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    <span>~{proc.estimatedDurationMinutes} mins</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingProcedure(proc);
                      setProcedureForm({
                        name: proc.name,
                        description: proc.description || "",
                        category: proc.category,
                        estimatedDurationMinutes: proc.estimatedDurationMinutes,
                        requiredEquipment: proc.requiredEquipment ? proc.requiredEquipment.join(", ") : "",
                        preOpRequirements: proc.preOpRequirements ? proc.preOpRequirements.join(", ") : "",
                        postOpInstructions: proc.postOpInstructions ? proc.postOpInstructions.join(", ") : "",
                        isActive: proc.isActive,
                      });
                      setShowProcedureModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete procedure ${proc.name}?`)) {
                        deleteProcedureMut.mutate(proc.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: OPERATING ROOMS ─── */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const st = ROOM_STATUS_MAP[room.status] || ROOM_STATUS_MAP.available;
            return (
              <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{room.name}</h3>
                    {room.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{room.description}</p>
                    )}
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border", st.bg, st.text, st.border)}>
                    {st.label}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-bold">{room.capacity || 1} patient(s)</span>
                  </div>
                  {room.equipment && room.equipment.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Equipment</span>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((eq, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-bold">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(["available", "occupied", "cleaning", "maintenance"] as RoomStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateRoomMut.mutate({ id: room.id, dto: { status: s } })}
                        title={`Set to ${s}`}
                        className={cn(
                          "w-5 h-5 rounded-full border text-[8px] font-bold flex items-center justify-center transition-all",
                          room.status === s ? "ring-2 ring-emerald-500 ring-offset-1 font-black" : "opacity-40 hover:opacity-100",
                          s === "available" ? "bg-emerald-500 text-white" :
                          s === "occupied" ? "bg-amber-500 text-white" :
                          s === "cleaning" ? "bg-sky-500 text-white" : "bg-rose-500 text-white"
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setRoomForm({
                          name: room.name,
                          description: room.description || "",
                          status: room.status,
                          capacity: room.capacity || 1,
                          equipment: room.equipment ? room.equipment.join(", ") : "",
                          isActive: room.isActive,
                        });
                        setShowRoomModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete operating room ${room.name}?`)) {
                          deleteRoomMut.mutate(room.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: SCHEDULE SURGERY ─── */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Surgical Operation"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Procedure *</label>
            <select
              required
              value={scheduleForm.procedureId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, procedureId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
            >
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) - ~{p.estimatedDurationMinutes} mins
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Operating Room *</label>
              <select
                required
                value={scheduleForm.operatingRoomId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, operatingRoomId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Primary Surgeon *</label>
              <select
                required
                value={scheduleForm.primarySurgeonId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, primarySurgeonId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                {staffList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    Dr. {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient *</label>
            <select
              required
              value={scheduleForm.patientId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, patientId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
            >
              {patientsList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} {p.phone ? `(${p.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={scheduleForm.scheduledStartTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledStartTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated End Time</label>
              <input
                type="datetime-local"
                value={scheduleForm.scheduledEndTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEndTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Preoperative Notes</label>
            <textarea
              rows={2}
              value={scheduleForm.preoperativeNotes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, preoperativeNotes: e.target.value })}
              placeholder="Allergies, anesthesia instructions, preoperative consent status..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createScheduleMut.isPending}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {createScheduleMut.isPending ? "Booking..." : "Book Surgery"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: UPDATE SCHEDULE & CLINICAL LOGS ─── */}
      <Modal
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        title={`Surgery ${selectedSchedule?.surgeryNumber || ""}`}
      >
        {selectedSchedule && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="font-bold text-slate-900">
                {selectedSchedule.patient ? `${selectedSchedule.patient.firstName} ${selectedSchedule.patient.lastName}` : "Patient"}
              </p>
              <p className="text-slate-600">
                {selectedSchedule.procedure?.name} &bull; {selectedSchedule.operatingRoom?.name}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Surgery Status</label>
              <select
                value={statusUpdateNotes.status}
                onChange={(e) => setStatusUpdateNotes({ ...statusUpdateNotes, status: e.target.value as SurgeryStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress (Patient in Theater)</option>
                <option value="completed">Completed (Successfully Concluded)</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>

            {statusUpdateNotes.status === "cancelled" && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  value={statusUpdateNotes.cancellationReason}
                  onChange={(e) => setStatusUpdateNotes({ ...statusUpdateNotes, cancellationReason: e.target.value })}
                  placeholder="e.g. Patient unwell, high blood pressure spike..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Intraoperative Notes</label>
              <textarea
                rows={2}
                value={statusUpdateNotes.intraoperativeNotes}
                onChange={(e) => setStatusUpdateNotes({ ...statusUpdateNotes, intraoperativeNotes: e.target.value })}
                placeholder="Incision details, lens implant model, power, visco used..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Postoperative Instructions / Notes</label>
              <textarea
                rows={2}
                value={statusUpdateNotes.postoperativeNotes}
                onChange={(e) => setStatusUpdateNotes({ ...statusUpdateNotes, postoperativeNotes: e.target.value })}
                placeholder="Eye shield application, drops prescription, day-1 review date..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Complications (If Any)</label>
              <input
                type="text"
                value={statusUpdateNotes.complications}
                onChange={(e) => setStatusUpdateNotes({ ...statusUpdateNotes, complications: e.target.value })}
                placeholder="None or specify e.g. posterior capsular tear, vitreous loss..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleUpdateScheduleStatus}
                disabled={updateScheduleMut.isPending}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {updateScheduleMut.isPending ? "Updating..." : "Save Updates"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL: CREATE / EDIT PROCEDURE ─── */}
      <Modal
        isOpen={showProcedureModal}
        onClose={() => setShowProcedureModal(false)}
        title={editingProcedure ? "Edit Procedure" : "New Surgical Procedure"}
      >
        <form onSubmit={handleSaveProcedure} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Procedure Name *</label>
            <input
              required
              value={procedureForm.name}
              onChange={(e) => setProcedureForm({ ...procedureForm, name: e.target.value })}
              placeholder="e.g. Phacoemulsification with IOL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category *</label>
              <select
                value={procedureForm.category}
                onChange={(e) => setProcedureForm({ ...procedureForm, category: e.target.value as ProcedureCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                {PROCEDURE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated Duration (mins) *</label>
              <input
                type="number"
                min="5"
                required
                value={procedureForm.estimatedDurationMinutes}
                onChange={(e) => setProcedureForm({ ...procedureForm, estimatedDurationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
            <textarea
              rows={2}
              value={procedureForm.description}
              onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
              placeholder="Clinical scope and indication"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Required Equipment (comma separated)</label>
            <input
              type="text"
              value={procedureForm.requiredEquipment}
              onChange={(e) => setProcedureForm({ ...procedureForm, requiredEquipment: e.target.value })}
              placeholder="e.g. Operating Microscope, Phaco Machine, Biometry"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowProcedureModal(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProcedureMut.isPending || updateProcedureMut.isPending}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {createProcedureMut.isPending || updateProcedureMut.isPending ? "Saving..." : editingProcedure ? "Update Procedure" : "Create Procedure"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: CREATE / EDIT OPERATING ROOM ─── */}
      <Modal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        title={editingRoom ? "Edit Operating Room" : "New Operating Room"}
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Room Name *</label>
            <input
              required
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              placeholder="e.g. Theater 1 (Main OR)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as RoomStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Equipment Installed (comma separated)</label>
            <input
              type="text"
              value={roomForm.equipment}
              onChange={(e) => setRoomForm({ ...roomForm, equipment: e.target.value })}
              placeholder="e.g. Zeiss Microscope, Alcon Infinity, HEPA Filtration"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRoomModal(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRoomMut.isPending || updateRoomMut.isPending}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {createRoomMut.isPending || updateRoomMut.isPending ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
