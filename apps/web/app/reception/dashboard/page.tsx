"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserPlus, Users, Clock, ShieldCheck, CalendarDays, 
  Search, ArrowRight, Plus, CheckCircle2, AlertCircle,
  MoreHorizontal, ChevronRight, Phone, UserCheck, X,
  RefreshCw, Stethoscope, Activity, Camera, FileText,
  Ban, CalendarClock, Save, LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";

const stats = [
  { label: "Today's Queue", value: "24", icon: Users, color: "text-sky-600", bg: "bg-sky-50", href: "/reception/queue" },
  { label: "Pending HMO", value: "8", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", href: "/reception/billing#hmo-queue" },
  { label: "Bookings", value: "12", icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50", href: "/reception/appointments" },
  { label: "Avg. Wait", value: "15m", icon: Clock, color: "text-rose-600", bg: "bg-rose-50", href: "/reception/queue" },
];

const todayAppointments = [
  { id: "APT-1042", patient: "Chidimma Okoro", time: "09:00 AM", type: "Eye Consultation", status: "Arrived", hmo: "Reliance Health" },
  { id: "APT-1043", patient: "Babatunde Lawal", time: "10:30 AM", type: "Lens Purchase", status: "Scheduled", hmo: "Private" },
  { id: "APT-1044", patient: "Yuki Tanaka", time: "11:15 AM", type: "Follow-up", status: "Confirmed", hmo: "Axa Mansard" },
  { id: "APT-1045", patient: "Sarah Mensah", time: "12:00 PM", type: "Emergency", status: "Emergency", hmo: "Private" },
];

const queueItems = [
  { id: "V001", patient: "Fatima Yusuf", time: "10 mins ago", status: "HMO Verifying", color: "amber" },
  { id: "V002", patient: "John Doe", time: "15 mins ago", status: "To Nurse", color: "sky" },
  { id: "V003", patient: "Emeka Obi", time: "22 mins ago", status: "In Consultation", color: "emerald" },
];

const hmoPendingList = [
  { patient: "Chidimma Okoro", provider: "Reliance Health", code: "HMO-901", amount: "NGN 12,000" },
  { patient: "Yuki Tanaka", provider: "Axa Mansard", code: "HMO-902", amount: "NGN 8,000" },
  { patient: "Emeka Obi", provider: "Hygeia", code: "HMO-903", amount: "NGN 35,000" },
];

export default function ReceptionDashboard() {
  const router = useRouter();
  const [toast, setToast] = useState("");

  // Modal states
  const [queueAction, setQueueAction] = useState<any>(null);
  const [aptDetail, setAptDetail] = useState<any>(null);
  const [aptAction, setAptAction] = useState<"arrived" | "checkin" | "reschedule" | "cancel" | null>(null);
  const [showHmoModal, setShowHmoModal] = useState(false);
  const [showQuickReg, setShowQuickReg] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showScanDocs, setShowScanDocs] = useState(false);

  // Quick Registration form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPurpose, setRegPurpose] = useState("Eye consultation");
  const [regPlan, setRegPlan] = useState("Private");

  // Walk-in form
  const [walkName, setWalkName] = useState("");
  const [walkPhone, setWalkPhone] = useState("");
  const [walkEmail, setWalkEmail] = useState("");
  const [walkPurpose, setWalkPurpose] = useState("Eye consultation");
  const [walkPlan, setWalkPlan] = useState("Private");
  const [walkIdType, setWalkIdType] = useState("National ID");
  const [walkIdNumber, setWalkIdNumber] = useState("");

  // Scan docs
  const [scanStep, setScanStep] = useState<"select" | "scanning" | "done">("select");
  const [scanType, setScanType] = useState("");

  const [hmoVerified, setHmoVerified] = useState<string[]>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleQueueAction = (action: string) => {
    setQueueAction(null);
    showToast(`${action} for ${queueAction?.patient}`);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={18} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frontdesk Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back. Here&apos;s what&apos;s happening at the reception today.</p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600">
          <CalendarDays size={18} className="text-sky-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-5 hover:shadow-md hover:border-sky-200 transition-all cursor-pointer"
          >
            <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Quick Actions — now open modals */}
          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quick Registration & Entry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setShowQuickReg(true)}
                className="group relative bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all text-left overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg bg-sky-500">
                  <UserPlus size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Registration</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Basic details for immediate queueing</p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className="text-sky-500" />
                </div>
              </button>

              <button onClick={() => setShowWalkIn(true)}
                className="group relative bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all text-left overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg bg-emerald-500">
                  <Plus size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Walk-in Entry</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Full profile for new walk-in patients</p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className="text-sky-500" />
                </div>
              </button>

              <button onClick={() => setShowScanDocs(true)}
                className="group relative bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all text-left overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg bg-slate-700">
                  <Search size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Scan Documents</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">OCR for IDs and HMO cards</p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className="text-sky-500" />
                </div>
              </button>
            </div>
          </section>

          {/* Queue Overview */}
          <section className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">Queue Overview</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">Active patients in workflow</p>
              </div>
              <Link href="/reception/queue" className="text-[10px] sm:text-xs font-black text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                View Full Queue <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {queueItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-[10px] sm:text-xs shrink-0">
                      {item.id}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.patient}</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                    <div className={cn(
                      "px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest",
                      item.color === "amber" ? "bg-amber-100 text-amber-700" : 
                      item.color === "sky" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {item.status}
                    </div>
                    <button onClick={() => setQueueAction(item)} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6 sm:space-y-8">
          {/* Today's Bookings */}
          <section className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="p-5 sm:p-8 border-b border-slate-50">
              <h2 className="text-base sm:text-lg font-black text-slate-900">Today&apos;s Bookings</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">Scheduled Appointments</p>
            </div>
            <div className="p-3 sm:p-4 space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} onClick={() => setAptDetail(apt)}
                  className="p-4 sm:p-5 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-black text-sky-600 mb-1">{apt.time}</p>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{apt.patient}</h4>
                    </div>
                    {apt.status === "Arrived" ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : apt.status === "Emergency" ? (
                      <AlertCircle size={18} className="text-rose-500 animate-pulse shrink-0" />
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tight">{apt.type}</span>
                    <span className={cn(
                      "text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md",
                      apt.hmo === "Private" ? "bg-slate-200 text-slate-600" : "bg-sky-100 text-sky-700"
                    )}>
                      {apt.hmo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6">
              <Link href="/reception/appointments#lookup"
                className="w-full py-3 sm:py-4 rounded-2xl bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                <CalendarDays size={16} /> Manage All Appointments
              </Link>
            </div>
          </section>

          {/* HMO Verification Notice */}
          <button onClick={() => setShowHmoModal(true)}
            className="w-full bg-gradient-to-br from-amber-500 to-orange-600 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <ShieldCheck size={40} className="mb-4 sm:mb-6 opacity-80" />
            <h3 className="text-lg sm:text-xl font-black mb-2">HMO Verification Queue</h3>
            <p className="text-xs sm:text-sm text-white/80 font-medium mb-4 sm:mb-6">There are 8 pending HMO verifications that require immediate attention from the front desk.</p>
            <div className="inline-flex px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-amber-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-all items-center gap-2">
              Process Queue <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </div>

      {/* ====== QUEUE ACTION MODAL ====== */}
      <Modal isOpen={!!queueAction} onClose={() => setQueueAction(null)} title={`Queue — ${queueAction?.patient}`}>
        {queueAction && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">{queueAction.id}</div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{queueAction.patient}</h4>
                <p className="text-sm text-slate-500">{queueAction.time} &bull; {queueAction.status}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleQueueAction("Marked as Arrived")}
                className="w-full p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                <LogIn size={16} /> Mark as Arrived
              </button>
              <button onClick={() => handleQueueAction("Sent to Nursing")}
                className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
                <Stethoscope size={16} /> Send to Nursing
              </button>
              <button onClick={() => { setQueueAction(null); showToast(`Calling ${queueAction.patient}`); }}
                className="w-full p-4 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
                <Phone size={16} /> Call Patient
              </button>
              <button onClick={() => handleQueueAction("Removed from queue")}
                className="w-full p-4 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 flex items-center justify-center gap-2">
                <X size={16} /> Remove from Queue
              </button>
            </div>
            <button onClick={() => setQueueAction(null)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        )}
      </Modal>

      {/* ====== APPOINTMENT DETAIL MODAL ====== */}
      <Modal isOpen={!!aptDetail} onClose={() => setAptDetail(null)} title="Appointment Details">
        {aptDetail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700"><CalendarDays size={24} /></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{aptDetail.patient}</h4>
                    <p className="text-sm text-slate-500">{aptDetail.time} &bull; {aptDetail.type}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0",
                    aptDetail.status === "Arrived" ? "bg-emerald-100 text-emerald-700" :
                    aptDetail.status === "Emergency" ? "bg-rose-100 text-rose-700 animate-pulse" :
                    aptDetail.status === "Confirmed" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
                  )}>{aptDetail.status}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Plan: {aptDetail.hmo} &bull; ID: {aptDetail.id}</p>
              </div>
            </div>
            <div className="space-y-2">
              {aptDetail.status !== "Arrived" && (
                <button onClick={() => { setAptDetail(null); showToast(`${aptDetail.patient} marked as Arrived`); }}
                  className="w-full p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Mark as Arrived
                </button>
              )}
              <button onClick={() => { setAptDetail(null); setAptAction("checkin"); }}
                className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
                <LogIn size={16} /> Check In Patient
              </button>
              <button onClick={() => { setAptDetail(null); setAptAction("reschedule"); }}
                className="w-full p-4 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
                <CalendarClock size={16} /> Reschedule
              </button>
              <button onClick={() => { setAptDetail(null); setAptAction("cancel"); }}
                className="w-full p-4 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 flex items-center justify-center gap-2">
                <Ban size={16} /> Cancel Appointment
              </button>
            </div>
            <button onClick={() => setAptDetail(null)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
          </div>
        )}
      </Modal>

      {/* ====== RESCHEDULE MODAL ====== */}
      <Modal isOpen={aptAction === "reschedule"} onClose={() => setAptAction(null)} title="Reschedule Appointment">
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-800 font-medium">
            Select a new date and time for this appointment.
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Time</label>
            <input type="time" defaultValue="10:00"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
            <select className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
              <option>Patient request</option>
              <option>Doctor unavailable</option>
              <option>Emergency</option>
              <option>Other</option>
            </select>
          </div>
          <button onClick={() => { setAptAction(null); showToast("Appointment rescheduled"); }}
            className="w-full p-4 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 flex items-center justify-center gap-2">
            <CalendarClock size={16} /> Confirm Reschedule
          </button>
        </div>
      </Modal>

      {/* ====== CANCEL MODAL ====== */}
      <Modal isOpen={aptAction === "cancel"} onClose={() => setAptAction(null)} title="Cancel Appointment">
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
            <Ban size={32} className="text-rose-500" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Cancel this appointment?</h4>
            <p className="text-sm text-slate-500 mt-1">This action cannot be undone. The time slot will be freed.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setAptAction(null); showToast("Appointment cancelled"); }}
              className="w-full p-4 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700">Yes, Cancel</button>
            <button onClick={() => setAptAction(null)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Keep Appointment</button>
          </div>
        </div>
      </Modal>

      {/* ====== CHECK-IN MODAL ====== */}
      <Modal isOpen={aptAction === "checkin"} onClose={() => setAptAction(null)} title="Check In Patient">
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700"><UserCheck size={28} /></div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{aptDetail?.patient}</h4>
              <p className="text-sm text-slate-500">{aptDetail?.type} &bull; {aptDetail?.hmo}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Station</label>
            <select className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
              <option>Nursing</option>
              <option>Consultation</option>
              <option>Optical</option>
              <option>HMO Queue</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (optional)</label>
            <textarea rows={3} placeholder="Special instructions..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm resize-none" />
          </div>
          <button onClick={() => { setAptAction(null); showToast(`${aptDetail?.patient} checked in`); }}
            className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
            <LogIn size={16} /> Confirm Check-In
          </button>
        </div>
      </Modal>

      {/* ====== HMO VERIFICATION MODAL ====== */}
      <Modal isOpen={showHmoModal} onClose={() => setShowHmoModal(false)} title="HMO Verification Queue">
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Review and verify pending HMO authorizations.</p>
          <div className="space-y-3">
            {hmoPendingList.map((item) => {
              const verified = hmoVerified.includes(item.code);
              return (
                <div key={item.code} className={cn(
                  "p-4 rounded-2xl border transition-all",
                  verified ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-100"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{item.patient}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.provider} &bull; {item.code}</p>
                      <p className="text-xs font-black text-slate-700 mt-1">{item.amount}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {verified ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-widest">Verified</span>
                      ) : (
                        <>
                          <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-[8px] font-black uppercase tracking-widest">Pending</span>
                          <button onClick={() => setHmoVerified(prev => [...prev, item.code])}
                            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-amber-700">Approve</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {hmoVerified.length > 0 && (
            <button onClick={() => { setShowHmoModal(false); showToast(`${hmoVerified.length} HMO requests verified`); }}
              className="w-full p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
              <Save size={16} /> Submit Verifications
            </button>
          )}
          <button onClick={() => setShowHmoModal(false)}
            className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
        </div>
      </Modal>

      {/* ====== QUICK REGISTRATION MODAL ====== */}
      <Modal isOpen={showQuickReg} onClose={() => setShowQuickReg(false)} title="Quick Registration">
        <div className="space-y-5">
          <p className="text-sm text-slate-500">Enter basic details to add patient to the queue immediately.</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. John Doe"
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="e.g. +234 800 000 0000"
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose</label>
                <select value={regPurpose} onChange={e => setRegPurpose(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
                  <option>Eye consultation</option>
                  <option>Lens purchase</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</label>
                <select value={regPlan} onChange={e => setRegPlan(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
                  <option>Private</option>
                  <option>HMO</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={() => { setShowQuickReg(false); setRegName(""); setRegPhone(""); showToast(`${regName || "Patient"} registered & added to queue`); }}
            disabled={!regName || !regPhone}
            className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <UserPlus size={16} /> Register & Add to Queue
          </button>
        </div>
      </Modal>

      {/* ====== WALK-IN ENTRY MODAL ====== */}
      <Modal isOpen={showWalkIn} onClose={() => setShowWalkIn(false)} title="Walk-in Entry">
        <div className="space-y-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-500">Full registration for new walk-in patients.</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input value={walkName} onChange={e => setWalkName(e.target.value)} placeholder="Full name"
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <input value={walkPhone} onChange={e => setWalkPhone(e.target.value)} placeholder="Phone"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <input type="email" value={walkEmail} onChange={e => setWalkEmail(e.target.value)} placeholder="Email"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Type</label>
                <select value={walkIdType} onChange={e => setWalkIdType(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
                  <option>National ID</option>
                  <option>Passport</option>
                  <option>Driver&apos;s License</option>
                  <option>Voter&apos;s Card</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Number</label>
                <input value={walkIdNumber} onChange={e => setWalkIdNumber(e.target.value)} placeholder="ID number"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose</label>
                <select value={walkPurpose} onChange={e => setWalkPurpose(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
                  <option>Eye consultation</option>
                  <option>Lens purchase</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</label>
                <select value={walkPlan} onChange={e => setWalkPlan(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900">
                  <option>Private</option>
                  <option>HMO</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={() => { setShowWalkIn(false); showToast(`${walkName || "Walk-in patient"} registered`); setWalkName(""); setWalkPhone(""); setWalkEmail(""); setWalkIdNumber(""); }}
            disabled={!walkName || !walkPhone}
            className="w-full p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Plus size={16} /> Complete Registration
          </button>
        </div>
      </Modal>

      {/* ====== SCAN DOCUMENTS MODAL ====== */}
      <Modal isOpen={showScanDocs} onClose={() => setShowScanDocs(false)} title="Scan Documents">
        <div className="space-y-5">
          {scanStep === "select" && (
            <>
              <p className="text-sm text-slate-500">Select document type to scan via OCR.</p>
              <div className="grid grid-cols-2 gap-3">
                {["National ID", "Passport", "HMO Card", "Referral Letter"].map(type => (
                  <button key={type} onClick={() => { setScanType(type); setScanStep("scanning"); setTimeout(() => setScanStep("done"), 2000); }}
                    className="p-5 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all text-center">
                    <Camera size={28} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-black text-slate-700">{type}</p>
                  </button>
                ))}
              </div>
            </>
          )}
          {scanStep === "scanning" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Camera size={32} className="text-sky-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">Scanning {scanType}...</p>
              <p className="text-xs text-slate-400 mt-1">Processing OCR</p>
            </div>
          )}
          {scanStep === "done" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">Scan Complete</p>
                <p className="text-sm text-slate-500">Document extracted via OCR successfully.</p>
              </div>
              <button onClick={() => { setScanStep("select"); setScanType(""); }}
                className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
                <Camera size={16} /> Scan Another
              </button>
            </div>
          )}
          <button onClick={() => { setShowScanDocs(false); setScanStep("select"); setScanType(""); }}
            className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
        </div>
      </Modal>
    </div>
  );
}
