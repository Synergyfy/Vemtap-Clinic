"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  "Eye consultation",
  "Eye test",
  "Lens purchase",
  "Frame selection",
  "Lens pickup",
  "Follow-up",
  "Emergency care",
];

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookings[0].id);
  const [newBooking, setNewBooking] = useState({
    patient: "",
    phone: "",
    purpose: "Eye consultation",
    time: "02:00 PM",
  });

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) ?? bookings[0];

  const filteredBookings = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return bookings;
    return bookings.filter((booking) =>
      [booking.patient, booking.patientId, booking.id, booking.purpose, booking.status]
        .join(" ")
        .toLowerCase()
        .includes(cleanQuery)
    );
  }, [bookings, query]);

  const arrivedCount = bookings.filter((booking) => booking.status === "Arrived").length;
  const priorityCount = bookings.filter((booking) => booking.status === "Priority").length;

  const updateSelectedBooking = (status: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === selectedBooking.id ? { ...booking, status } : booking
      )
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
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments & Lookup</h1>
          <p className="text-slate-500 font-medium">Find booked patients, mark arrivals, and create mock frontdesk bookings.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Bookings", value: String(bookings.length), icon: CalendarDays },
            { label: "Arrived", value: String(arrivedCount), icon: UserCheck },
            { label: "Priority", value: String(priorityCount), icon: AlertCircle },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-[1.5rem] px-5 py-4 shadow-sm">
              <stat.icon size={18} className="text-sky-600 mb-2" />
              <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section id="lookup" className="xl:col-span-2 bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden scroll-mt-24">
          <div className="p-6 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Lookup appointment by name, patient ID, booking ID, purpose, or status..."
                className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/15 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={cn(
                  "w-full p-6 text-left transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                  selectedBooking.id === booking.id ? "bg-sky-50/70" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    {booking.time.split(" ")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{booking.patient}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{booking.patientId} - {booking.id}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">{booking.purpose}</span>
                  <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", booking.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{booking.plan}</span>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[9px] font-black uppercase tracking-widest">{booking.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="bg-white border border-slate-100 rounded-[3rem] shadow-sm p-8">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900">Arrival Actions</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mock appointment lookup</p>
              </div>
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Selected Patient</p>
                <p className="text-lg font-black text-slate-900">{selectedBooking.patient}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">{selectedBooking.time} - {selectedBooking.purpose}</p>
              </div>
              <button onClick={() => updateSelectedBooking("Arrived")} className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <UserCheck size={16} /> Mark Arrived & Send to Check-In
              </button>
              <button onClick={() => updateSelectedBooking("Rescheduled")} className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Clock size={16} /> Reschedule
              </button>
            </div>
          </section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black">New Booking</h2>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Frontend mock</p>
              </div>
            </div>
            <div className="space-y-3">
              <input value={newBooking.patient} onChange={(event) => setNewBooking({ ...newBooking, patient: event.target.value })} placeholder="Patient name" className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <input value={newBooking.phone} onChange={(event) => setNewBooking({ ...newBooking, phone: event.target.value })} placeholder="Phone number" className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-sm font-bold placeholder:text-white/30" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newBooking.purpose} onChange={(event) => setNewBooking({ ...newBooking, purpose: event.target.value })} className="px-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold">
                  {purposeOptions.map((purpose) => <option key={purpose} value={purpose} className="text-slate-900">{purpose}</option>)}
                </select>
                <input value={newBooking.time} onChange={(event) => setNewBooking({ ...newBooking, time: event.target.value })} className="px-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:outline-none text-xs font-bold" />
              </div>
              <button onClick={createMockBooking} className="w-full py-4 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all">
                Create Mock Booking
              </button>
            </div>
          </motion.section>
        </aside>
      </div>
    </div>
  );
}
