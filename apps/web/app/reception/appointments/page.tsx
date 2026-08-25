"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle, CalendarDays, CheckCircle2, Clock, Plus, Search, UserCheck,
  Phone, ShieldCheck, Ban, CalendarClock, LogIn, X, ChevronRight, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

type Booking = {
  id: string;
  patient: string;
  patientId: string;
  time: string;
  purpose: string;
  plan: string;
  status: string;
};

const initialBookings: Booking[] = [
  { id: "APT-1042", patient: "Chidimma Okoro", patientId: "PT-2024-001", time: "09:00 AM", purpose: "Eye consultation", plan: "HMO", status: "Arrived" },
  { id: "APT-1043", patient: "Babatunde Lawal", patientId: "PT-2024-002", time: "10:30 AM", purpose: "Lens purchase", plan: "Private", status: "Scheduled" },
  { id: "APT-1044", patient: "Yuki Tanaka", patientId: "PT-2024-003", time: "11:15 AM", purpose: "Follow-up", plan: "HMO", status: "Confirmed" },
  { id: "APT-1045", patient: "Sarah Mensah", patientId: "PT-2024-004", time: "12:00 PM", purpose: "Emergency care", plan: "Private", status: "Priority" },
];

const purposeOptions = [
  "Eye consultation", "Eye test", "Lens purchase", "Frame selection",
  "Lens pickup", "Follow-up", "Emergency care",
];

const statusStyles: Record<string, string> = {
  Scheduled: "bg-slate-100 text-slate-600",
  Confirmed: "bg-sky-100 text-sky-700",
  Arrived: "bg-emerald-100 text-emerald-700",
  Priority: "bg-rose-100 text-rose-700",
  Rescheduled: "bg-amber-100 text-amber-700",
  Cancelled: "bg-slate-200 text-slate-500",
};

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookings[0].id);
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState("");

  const [newBooking, setNewBooking] = useState({ patient: "", phone: "", purpose: "Eye consultation", time: "02:00 PM" });

  // Modal states
  const [showDetail, setShowDetail] = useState(false);
  const [showArrived, setShowArrived] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [arrivedStation, setArrivedStation] = useState("Nursing");
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [rescheduleReason, setRescheduleReason] = useState("Patient request");

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) ?? bookings[0];

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesSearch = !q || [b.patient, b.patientId, b.id, b.purpose, b.status, b.plan].join(" ").toLowerCase().includes(q);
      const matchesFilter = statusFilter === "All" || b.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, query, statusFilter]);

  const arrivedCount = bookings.filter((b) => b.status === "Arrived").length;
  const priorityCount = bookings.filter((b) => b.status === "Priority").length;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateBookingStatus = (status: string) => {
    setBookings((current) =>
      current.map((b) => (b.id === selectedBooking.id ? { ...b, status } : b))
    );
  };

  const createMockBooking = () => {
    if (!newBooking.patient.trim()) return;
    const nextBooking: Booking = {
      id: `APT-${1042 + bookings.length}`,
      patient: newBooking.patient,
      patientId: "Walk-in",
      time: newBooking.time,
      purpose: newBooking.purpose,
      plan: "Private",
      status: "Scheduled",
    };
    setBookings((current) => [nextBooking, ...current]);
    setSelectedBookingId(nextBooking.id);
    setNewBooking({ patient: "", phone: "", purpose: "Eye consultation", time: "02:00 PM" });
    showToast("Booking created");
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Manage bookings, mark arrivals, and create appointments.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Total", value: String(bookings.length), icon: CalendarDays, filter: "All" },
            { label: "Arrived", value: String(arrivedCount), icon: UserCheck, filter: "Arrived" },
            { label: "Priority", value: String(priorityCount), icon: AlertCircle, filter: "Priority" },
          ].map((stat) => (
            <button key={stat.label} onClick={() => setStatusFilter(stat.filter)}
              className={cn("bg-white border rounded-xl sm:rounded-[1.5rem] px-3 sm:px-5 py-3 sm:py-4 shadow-sm text-left transition-all hover:shadow-md", statusFilter === stat.filter ? "border-sky-200 bg-sky-50" : "border-slate-100")}>
              <stat.icon size={16} className={cn("mb-1 sm:mb-2", statusFilter === stat.filter ? "text-sky-600" : "text-sky-400")} />
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-8">
        {/* Booking List */}
        <section id="lookup" className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm overflow-hidden scroll-mt-24">
          <div className="p-4 sm:p-6 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Lookup by name, ID, purpose, status..."
                className="w-full pl-11 sm:pl-14 pr-3 sm:pr-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/15 font-bold text-slate-900 text-sm" />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredBookings.map((booking) => (
              <button key={booking.id} onClick={() => { setSelectedBookingId(booking.id); setShowDetail(true); }}
                className={cn(
                  "w-full p-4 sm:p-6 text-left transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4",
                  selectedBooking.id === booking.id ? "bg-sky-50/70" : "hover:bg-slate-50"
                )}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-[9px] sm:text-xs shrink-0">
                    {booking.time.split(" ")[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                      {booking.patient}
                      {booking.status === "Priority" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{booking.patientId} &bull; {booking.id}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{booking.purpose}</span>
                  <span className={cn("px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", booking.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{booking.plan}</span>
                  <span className={cn("px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest", statusStyles[booking.status] || "bg-slate-100 text-slate-600")}>{booking.status}</span>
                </div>
              </button>
            ))}
            {filteredBookings.length === 0 && (
              <div className="p-8 sm:p-12 text-center text-slate-400">
                <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No bookings match your filter</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 sm:space-y-8">
          {/* Arrival Actions */}
          <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-5 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Arrival Actions</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Selected appointment</p>
              </div>
              <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Selected Patient</p>
                <p className="text-base sm:text-lg font-black text-slate-900 truncate">{selectedBooking.patient}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">{selectedBooking.time} &bull; {selectedBooking.purpose}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", statusStyles[selectedBooking.status] || "bg-slate-100 text-slate-600")}>{selectedBooking.status}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", selectedBooking.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{selectedBooking.plan}</span>
                </div>
              </div>
              {selectedBooking.status !== "Arrived" && selectedBooking.status !== "Cancelled" && (
                <button onClick={() => setShowArrived(true)}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  <UserCheck size={14} /> Mark Arrived & Check-In
                </button>
              )}
              <button onClick={() => setShowReschedule(true)}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <CalendarClock size={14} /> Reschedule
              </button>
              <button onClick={() => setShowCancel(true)}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-rose-200 text-rose-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                <Ban size={14} /> Cancel Appointment
              </button>
            </div>
          </section>

          {/* New Booking */}
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center"><Plus size={18} /></div>
              <div>
                <h2 className="text-base sm:text-lg font-black">New Booking</h2>
                <p className="text-[9px] sm:text-[10px] text-white/50 font-black uppercase tracking-widest">Frontdesk</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <input value={newBooking.patient} onChange={(e) => setNewBooking({ ...newBooking, patient: e.target.value })} placeholder="Patient name"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <input value={newBooking.phone} onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })} placeholder="Phone number"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <select value={newBooking.purpose} onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                  className="px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-[10px] sm:text-xs font-bold">
                  {purposeOptions.map((p) => <option key={p} value={p} className="text-slate-900">{p}</option>)}
                </select>
                <select value={newBooking.time} onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                  className="px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-[10px] sm:text-xs font-bold">
                  {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={createMockBooking} disabled={!newBooking.patient.trim()}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-slate-900 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all disabled:opacity-50">
                Create Booking
              </button>
            </div>
          </motion.section>
        </aside>
      </div>

      {/* ====== DETAIL MODAL ====== */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Appointment Details">
        {selectedBooking && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0"><CalendarDays size={24} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedBooking.patient}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedBooking.time} &bull; {selectedBooking.purpose}</p>
                  </div>
                  <span className={cn("px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", statusStyles[selectedBooking.status] || "bg-slate-100 text-slate-600")}>{selectedBooking.status}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{selectedBooking.plan} &bull; {selectedBooking.id} &bull; {selectedBooking.patientId}</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedBooking.status !== "Arrived" && selectedBooking.status !== "Cancelled" && (
                <button onClick={() => { setShowDetail(false); setShowArrived(true); }}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <LogIn size={14} /> Mark Arrived & Check-In
                </button>
              )}
              <button onClick={() => { setShowDetail(false); setShowReschedule(true); }}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-amber-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
                <CalendarClock size={14} /> Reschedule
              </button>
              <button onClick={() => { setShowDetail(false); setShowCancel(true); }}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-700 flex items-center justify-center gap-2">
                <Ban size={14} /> Cancel Appointment
              </button>
            </div>
            <button onClick={() => setShowDetail(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        )}
      </Modal>

      {/* ====== ARRIVED MODAL ====== */}
      <Modal isOpen={showArrived} onClose={() => setShowArrived(false)} title="Mark Arrived & Check-In">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><UserCheck size={24} /></div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedBooking.patient}</h4>
              <p className="text-xs text-slate-500">{selectedBooking.purpose} &bull; {selectedBooking.plan}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Station</label>
            <select value={arrivedStation} onChange={(e) => setArrivedStation(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm">
              <option>Nursing</option>
              <option>Consultation</option>
              <option>Optical</option>
              <option>HMO Queue</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { updateBookingStatus("Arrived"); setShowArrived(false); showToast(`${selectedBooking.patient} arrived & sent to ${arrivedStation}`); }}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Confirm Arrival
            </button>
            <button onClick={() => setShowArrived(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ====== RESCHEDULE MODAL ====== */}
      <Modal isOpen={showReschedule} onClose={() => setShowReschedule(false)} title="Reschedule Appointment">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 text-xs sm:text-sm text-amber-800 font-medium">
            Reschedule <strong>{selectedBooking.patient}</strong> &mdash; {selectedBooking.time}, {selectedBooking.purpose}
          </div>
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">New Date</label>
            <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">New Time</label>
            <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
            <select value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm">
              <option>Patient request</option>
              <option>Doctor unavailable</option>
              <option>Emergency</option>
              <option>Other</option>
            </select>
          </div>
          <button onClick={() => { updateBookingStatus("Rescheduled"); setShowReschedule(false); showToast(`${selectedBooking.patient} rescheduled to ${rescheduleDate} ${rescheduleTime}`); }}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-amber-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
            <CalendarClock size={14} /> Confirm Reschedule
          </button>
        </div>
      </Modal>

      {/* ====== CANCEL MODAL ====== */}
      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)} title="Cancel Appointment">
        <div className="space-y-4 sm:space-y-5 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
            <Ban size={28} className="text-rose-500" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900">Cancel this appointment?</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1"><strong>{selectedBooking.patient}</strong> &bull; {selectedBooking.time}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { updateBookingStatus("Cancelled"); setShowCancel(false); showToast(`Appointment cancelled for ${selectedBooking.patient}`); }}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-rose-700">Yes, Cancel</button>
            <button onClick={() => setShowCancel(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Keep Appointment</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
