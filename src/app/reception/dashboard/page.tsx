"use client";

import React from "react";
import Link from "next/link";
import { 
  UserPlus, 
  Users, 
  Clock, 
  ShieldCheck, 
  CalendarDays, 
  Search, 
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const stats = [
  { label: "Today's Queue", value: "24", icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
  { label: "Pending HMO", value: "8", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Bookings", value: "12", icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Wait", value: "15m", icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
];

const quickActions = [
  { title: "Quick Registration", desc: "Basic details for immediate queueing", icon: UserPlus, color: "bg-sky-500", href: "/reception/patients#registration" },
  { title: "Walk-in Entry", desc: "Full profile for new walk-in patients", icon: Plus, color: "bg-emerald-500", href: "/reception/patients#walk-in" },
  { title: "Scan Documents", icon: Search, color: "bg-slate-700", desc: "OCR for IDs and HMO cards", href: "/reception/documents#scanner" },
];

const todayAppointments = [
  { id: "1", patient: "Chidimma Okoro", time: "09:00 AM", type: "Eye Consultation", status: "Arrived", hmo: "Reliance Health" },
  { id: "2", patient: "Babatunde Lawal", time: "10:30 AM", type: "Lens Purchase", status: "Scheduled", hmo: "Private" },
  { id: "3", patient: "Yuki Tanaka", time: "11:15 AM", type: "Follow-up", status: "Confirmed", hmo: "Axa Mansard" },
  { id: "4", patient: "Sarah Mensah", time: "12:00 PM", type: "Emergency", status: "Emergency", hmo: "Private" },
];

const queueItems = [
  { id: "V001", patient: "Fatima Yusuf", time: "10 mins ago", status: "HMO Verifying", color: "amber" },
  { id: "V002", patient: "John Doe", time: "15 mins ago", status: "To Nurse", color: "sky" },
  { id: "V003", patient: "Emeka Obi", time: "22 mins ago", status: "In Consultation", color: "emerald" },
];

export default function ReceptionDashboard() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Frontdesk Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back. Here&apos;s what&apos;s happening at the reception today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600">
            <CalendarDays size={18} className="text-sky-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Queue */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quick Registration & Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link
                  href={action.href}
                  key={action.title}
                  className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all text-left overflow-hidden"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg", action.color)}>
                    <action.icon size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{action.desc}</p>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-sky-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Queue Overview */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div>
                  <h2 className="text-lg font-black text-slate-900">Queue Overview</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Active patients in workflow</p>
               </div>
               <Link href="/reception/queue" className="text-xs font-black text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                  View Full Queue <ArrowRight size={14} />
               </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {queueItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs">
                      {item.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.patient}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      item.color === "amber" ? "bg-amber-100 text-amber-700" : 
                      item.color === "sky" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {item.status}
                    </div>
                    <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - HMO & Bookings */}
        <div className="space-y-8">
          {/* Today's Bookings */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-lg font-black text-slate-900">Today&apos;s Bookings</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Scheduled Appointments</p>
            </div>
            <div className="p-4 space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="p-5 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                   <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-black text-sky-600 mb-1">{apt.time}</p>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{apt.patient}</h4>
                      </div>
                      {apt.status === "Arrived" ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : apt.status === "Emergency" ? (
                        <AlertCircle size={18} className="text-rose-500 animate-pulse" />
                      ) : null}
                   </div>
                   <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{apt.type}</span>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md",
                        apt.hmo === "Private" ? "bg-slate-200 text-slate-600" : "bg-brand-blue/10 text-brand-blue"
                      )}>
                        {apt.hmo}
                      </span>
                   </div>
                </div>
              ))}
            </div>
            <div className="p-6 mt-2">
               <Link href="/reception/appointments#lookup" className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                  <CalendarDays size={16} /> Manage All Appointments
               </Link>
            </div>
          </section>

          {/* HMO Verification Notice */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
             <ShieldCheck size={48} className="mb-6 opacity-80" />
             <h3 className="text-xl font-black mb-2">HMO Verification Queue</h3>
             <p className="text-sm text-white/80 font-medium mb-6">There are 8 pending HMO verifications that require immediate attention from the front desk.</p>
             <Link href="/reception/billing#hmo-queue" className="px-6 py-3 bg-white text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-2">
                Process Queue <ArrowRight size={16} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
