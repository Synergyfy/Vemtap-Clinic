"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  ShieldCheck,
  User,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Plus,
  ArrowRight,
  CheckCircle2,
  Eye,
  Glasses,
  ShoppingCart,
  PackageCheck,
  Clock,
  AlertCircle,
  FileText,
  Heart,
  Loader2,
  X,
  Stethoscope,
  Wallet,
  Printer,
  QrCode,
  Scan,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";

const patients = [
  { id: "PT-2024-001", name: "Chidimma Okoro", phone: "+234 802 345 6789", email: "chidimma.o@gmail.com", type: "HMO", provider: "Reliance Health", lastVisit: "2 days ago", status: "Active" },
  { id: "PT-2024-002", name: "Babatunde Lawal", phone: "+234 810 987 6543", email: "b.lawal@yahoo.com", type: "Private", provider: "Self-Pay", lastVisit: "1 week ago", status: "Active" },
  { id: "PT-2024-003", name: "Yuki Tanaka", phone: "+234 905 123 4567", email: "yuki.t@tanaka.jp", type: "HMO", provider: "Axa Mansard", lastVisit: "Today", status: "Active" },
  { id: "PT-2024-004", name: "Sarah Mensah", phone: "+234 703 555 0192", email: "s.mensah@outlook.com", type: "Private", provider: "Self-Pay", lastVisit: "1 month ago", status: "Inactive" },
];

type CheckInStep = "SCAN" | "IDENTIFY" | "PURPOSE" | "PLAN" | "VERIFYING" | "COMPLETE";
type RegistrationStep = "PERSONAL" | "CONTACT" | "INSURANCE" | "SUCCESS";

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Check-in Flow State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInStep, setCheckInStep] = useState<CheckInStep>("SCAN");
  const [checkInId, setCheckInId] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);

  // Registration Flow State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regStep, setRegStep] = useState<RegistrationStep>("PERSONAL");
  const [regData, setRegData] = useState({
    fullName: "", dob: "", gender: "", phone: "", email: "", address: "", 
    planType: "Private", hmoProvider: "", hmoId: "", nextOfKin: "", kinPhone: ""
  });

  // Profile View State
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("overview");

  const openRegistration = (planType = "Private") => {
    setRegData((current) => ({ ...current, planType }));
    setRegStep("PERSONAL");
    setIsRegModalOpen(true);
  };

  const openHmoRegistration = () => {
    setRegData((current) => ({ ...current, planType: "HMO" }));
    setRegStep("INSURANCE");
    setIsRegModalOpen(true);
  };

  const startCheckInFromProfile = () => {
    if (!selectedPatient) return;
    setCheckInId(selectedPatient.id);
    setIsProfileModalOpen(false);
    setIsCheckInModalOpen(true);
    setCheckInStep("PURPOSE");
  };

  const handleIdSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkInId) return;
    setIsCheckInLoading(true);
    setTimeout(() => {
      setIsCheckInLoading(false);
      setIsCheckInModalOpen(true);
      setCheckInStep("IDENTIFY");
    }, 1000);
  };

  const finalizeCheckIn = () => {
    setCheckInStep("VERIFYING");
    setTimeout(() => {
      setCheckInStep("COMPLETE");
    }, 2500);
  };

  const handleRegistration = () => {
    setIsCheckInLoading(true);
    setTimeout(() => {
      setIsCheckInLoading(false);
      setRegStep("SUCCESS");
    }, 1500);
  };

  const purposes = [
    { id: "consult", label: "Eye Consultation", icon: Eye, desc: "Doctor's examination" },
    { id: "test", label: "Eye Test / Refraction", icon: Glasses, desc: "Check your vision" },
    { id: "lens_purchase", label: "Lens Purchase", icon: ShoppingCart, desc: "Buy prescription lenses" },
    { id: "frame_selection", label: "Frame Selection", icon: Glasses, desc: "Choose eyewear frames" },
    { id: "pickup", label: "Lens Pickup", icon: PackageCheck, desc: "Collect ready lenses" },
    { id: "followup", label: "Follow-up", icon: Clock, desc: "Review progress" },
    { id: "emergency", label: "Emergency", icon: AlertCircle, desc: "Urgent care", color: "text-rose-500" },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-slate-500 font-medium italic">Register new arrivals and manage existing records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => { setCheckInStep("SCAN"); setIsCheckInModalOpen(true); }}
             className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Scan size={18} className="text-sky-500" />
            Scan QR Check-In
          </button>
          <button 
            onClick={() => openRegistration()}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} />
            Register New Patient
          </button>
        </div>
      </div>

      {/* Registration Quick Select */}
      <div id="registration" className="grid grid-cols-1 md:grid-cols-4 gap-4 scroll-mt-24">
        {[
          { label: "New Patient", icon: UserPlus, color: "text-sky-600", bg: "bg-sky-50", desc: "First-time visitor", action: () => openRegistration() },
          { label: "Returning", icon: History, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Lookup record", action: () => { setCheckInStep("SCAN"); setIsCheckInModalOpen(true); } },
          { label: "HMO Patient", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", desc: "Verify provider", action: openHmoRegistration },
          { label: "Walk-in", icon: Plus, color: "text-rose-600", bg: "bg-rose-50", desc: "Immediate entry", action: () => openRegistration("Private"), id: "walk-in" },
        ].map((item) => (
          <button 
            key={item.label} 
            onClick={item.action}
            id={item.id}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-start text-left scroll-mt-24"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.bg, item.color)}>
              <item.icon size={22} />
            </div>
            <h3 className="text-sm font-black text-slate-900">{item.label}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, ID, phone number or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900 placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <div className="flex-1 md:flex-none h-14 bg-slate-50 p-1 rounded-2xl border border-slate-100 flex items-center">
            {["All", "HMO", "Private"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-6 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  filterType === type ? "bg-white text-sky-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table/List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Type</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Visit</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  onClick={() => { setSelectedPatient(patient); setIsProfileModalOpen(true); }}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-xs shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-all">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{patient.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{patient.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Phone size={12} className="text-slate-300" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Mail size={12} className="text-slate-300" />
                        {patient.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        patient.type === "HMO" ? "bg-amber-400" : "bg-emerald-400"
                      )} />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{patient.type}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{patient.provider}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">
                    {patient.lastVisit}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-sky-600 group/btn border border-transparent hover:border-sky-100 shadow-sm">
                      <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-sky-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-4">Start Registration Flow</h2>
            <p className="text-sky-100 font-medium mb-8 max-w-md">Seamlessly guide new patients through profile creation, HMO verification, and queue assignment.</p>
            <div className="flex wrap gap-4">
              <button 
                onClick={() => openRegistration()}
                className="px-8 py-4 bg-white text-sky-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all flex items-center gap-2"
              >
                New Profile <UserPlus size={16} />
              </button>
              <button 
                onClick={openHmoRegistration}
                className="px-8 py-4 bg-sky-500/20 backdrop-blur-md border border-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                HMO Verification <ShieldCheck size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Returning Patient?</h3>
                <p className="text-slate-400 font-medium">Fast-track check-in for existing records.</p>
              </div>
           </div>
           <form onSubmit={handleIdSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={checkInId}
                  onChange={(e) => setCheckInId(e.target.value)}
                  placeholder="Scan QR or Enter Patient ID..." 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-900"
                />
              </div>
              <button 
                type="submit"
                disabled={isCheckInLoading}
                className="w-full py-5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckInLoading ? <Loader2 size={20} className="animate-spin" /> : "Check-In Now"} <ArrowRight size={16} />
              </button>
           </form>
        </div>
      </div>

      {/* Patient Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Patient Record" className="max-w-4xl">
        <div className="p-0">
          {selectedPatient && (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-sky-600 text-2xl font-black shrink-0">
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                    <h2 className="text-2xl font-black text-slate-900 truncate">{selectedPatient.name}</h2>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">{selectedPatient.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><User size={12} className="text-sky-500" /> {selectedPatient.id}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Phone size={12} className="text-sky-500" /> {selectedPatient.phone}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck size={12} className="text-sky-500" /> {selectedPatient.provider}</div>
                  </div>
                </div>
                <button onClick={startCheckInFromProfile} className="w-full lg:w-auto px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-900/20 text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><Clock size={16} /> Check-In to Queue</button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-1 border-b border-slate-100 overflow-x-auto no-scrollbar">
                  {["overview", "medical", "billing", "documents"].map((tab) => (
                    <button key={tab} onClick={() => setActiveProfileTab(tab)} className={cn("px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap", activeProfileTab === tab ? "text-sky-600" : "text-slate-400 hover:text-slate-600")}>
                      {tab}{activeProfileTab === tab && <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />}
                    </button>
                  ))}
                </div>
                <div className="min-h-[250px]">
                   {activeProfileTab === "overview" && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-4">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Information</h4>
                           <div className="space-y-3">
                              <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-[10px] font-bold text-slate-400">Gender</span><span className="text-[10px] font-black text-slate-900">Female</span></div>
                              <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-[10px] font-bold text-slate-400">Age</span><span className="text-[10px] font-black text-slate-900">28 Years</span></div>
                              <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-400">Blood Group</span><span className="text-[10px] font-black text-rose-600">O+</span></div>
                           </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-4">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visit History</h4>
                           <div className="space-y-2">
                              {[{ date: "May 28, 2024", task: "Annual Eye Exam", dr: "Dr. Adebayo" }, { date: "Feb 12, 2024", task: "Lens Selection", dr: "Opt. Sarah" }].map((v, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                                   <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sky-500 shadow-sm shrink-0"><Calendar size={12} /></div>
                                   <div className="min-w-0"><p className="text-[9px] font-black text-slate-900 truncate">{v.task}</p><p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{v.date} • {v.dr}</p></div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </motion.div>
                   )}
                   {activeProfileTab === "medical" && <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4"><Stethoscope size={48} className="opacity-20" /><p className="text-sm font-bold uppercase tracking-widest">Medical history encrypted and secured</p><button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Authorize Access</button></div>}
                   {activeProfileTab === "billing" && <div className="space-y-4"><div className="flex items-center justify-between mb-4"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Invoices</h4><button className="text-[10px] font-black text-sky-600 uppercase tracking-widest underline">View All</button></div>{[{ id: "INV-8901", date: "May 28, 2024", amount: "₦45,000", status: "Paid" }, { id: "INV-7241", date: "Feb 12, 2024", amount: "₦12,500", status: "Paid" }].map((inv) => (<div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Wallet size={16} /></div><div><p className="text-xs font-black text-slate-900">{inv.id}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{inv.date}</p></div></div><div className="text-right"><p className="text-xs font-black text-slate-900">{inv.amount}</p><span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{inv.status}</span></div></div>))}</div>}
                   {activeProfileTab === "documents" && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ name: "ID Card.pdf", type: "Identification" }, { name: "Reliance_Policy.pdf", type: "HMO Card" }, { name: "Referral.pdf", type: "Clinical" }].map((doc, i) => (<div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all text-center group cursor-pointer"><div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition-all"><FileText size={20} /></div><p className="text-[10px] font-black text-slate-900 truncate mb-1">{doc.name}</p><p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{doc.type}</p></div>))}<button className="p-4 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-sky-200 hover:text-sky-500 transition-all"><Plus size={20} /><span className="text-[8px] font-black uppercase">Upload</span></button></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Unified Production Check-In Modal */}
      <Modal isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)} title="Production Check-In Flow">
        <div className="p-2 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {checkInStep === "SCAN" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-8 py-12">
                 <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-400 relative overflow-hidden group cursor-pointer hover:border-sky-500 transition-all">
                    <Scan size={48} className="group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={32} className="text-sky-600" /></div>
                 </div>
                 <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-900">QR Scan Check-In</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Position patient&apos;s digital or physical QR card</p>
                 </div>
                 <div className="w-full max-w-xs space-y-4">
                    <div className="relative">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       <input 
                         type="text" value={checkInId} onChange={(e) => setCheckInId(e.target.value)} 
                         placeholder="Or enter ID manually..." 
                         className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none font-bold text-slate-900" 
                       />
                    </div>
                    <button onClick={handleIdSubmit} className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Start Entry</button>
                 </div>
              </motion.div>
            )}

            {checkInStep === "IDENTIFY" && (
              <motion.div key="id" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 py-6">
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600 font-black text-xl">CO</div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Chidimma Okoro</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified ID: {checkInId || "PT-2024-001"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setCheckInStep("PURPOSE")} className="py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Confirm & Continue</button>
                   <button onClick={() => setCheckInStep("SCAN")} className="py-4 rounded-xl bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Wrong Patient</button>
                </div>
              </motion.div>
            )}

            {checkInStep === "PURPOSE" && (
              <motion.div key="purp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Visit Purpose</p>
                   <span className="text-[10px] font-black text-sky-600">Step 2/4</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {purposes.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPurpose(p.label); setCheckInStep("PLAN"); }} className="p-5 rounded-2xl border border-slate-100 hover:border-sky-500/20 hover:bg-sky-50 transition-all text-left group">
                      <p.icon size={20} className={cn("text-slate-400 group-hover:text-sky-600 mb-3", p.color)} />
                      <p className="text-xs font-black text-slate-900">{p.label}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {checkInStep === "PLAN" && (
              <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO/Private Selection</p>
                   <span className="text-[10px] font-black text-sky-600">Step 3/4</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   <button onClick={() => { setSelectedPlan("HMO"); finalizeCheckIn(); }} className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-amber-500/20 hover:bg-amber-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><ShieldCheck size={24} /></div>
                        <div className="text-left">
                           <span className="text-sm font-bold text-slate-900 block">HMO Verification</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reliance, Axa, etc.</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                   </button>
                   <button onClick={() => { setSelectedPlan("Private"); finalizeCheckIn(); }} className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:bg-emerald-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CreditCard size={24} /></div>
                        <div className="text-left">
                           <span className="text-sm font-bold text-slate-900 block">Private Patient</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Self-Pay / Instant Cash</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                   </button>
                </div>
              </motion.div>
            )}

            {checkInStep === "VERIFYING" && (
              <motion.div key="ver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-6">
                 <div className="relative w-20 h-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-sky-600" />
                    <div className="absolute inset-0 flex items-center justify-center text-sky-600"><ShieldCheck size={32} /></div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Automatic Queue Assignment...</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight italic">Form data being submitted to clinical backend</p>
                 </div>
              </motion.div>
            )}

            {checkInStep === "COMPLETE" && (
              <motion.div key="comp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-8">
                 <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm"><CheckCircle2 size={48} /></div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Check-In Successful</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Automatic Assignment: V-024</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Assigned Queue</p>
                    <p className="text-4xl font-black">NURSING STATION</p>
                    <p className="text-[9px] text-sky-400 font-bold uppercase tracking-widest mt-2">{selectedPurpose || "Eye Consultation"} • {selectedPlan || "Private"} • Wait Time: ~15 mins</p>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setIsCheckInModalOpen(false)} className="py-5 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"><Printer size={14} /> Print Slip</button>
                    <button onClick={() => setIsCheckInModalOpen(true)} className="py-5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Finished</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Patient Registration Modal (Updated for completeness) */}
      <Modal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} title="New Patient Registration">
        <div className="p-2 min-h-[400px]">
           <AnimatePresence mode="wait">
              {regStep === "PERSONAL" && (
                <motion.div key="p" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">1</div><p className="text-sm font-black text-slate-900">Personal Information</p></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input type="text" placeholder="John Doe" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900" value={regData.fullName} onChange={(e) => setRegData({...regData, fullName: e.target.value})}/></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label><select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900 appearance-none" value={regData.gender} onChange={(e) => setRegData({...regData, gender: e.target.value})}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option></select></div>
                   </div>
                   <button onClick={() => setRegStep("CONTACT")} className="w-full py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">Next: Contact Details <ChevronRight size={16} /></button>
                </motion.div>
              )}
              {regStep === "CONTACT" && (
                <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">2</div><p className="text-sm font-black text-slate-900">Address & Emergency Contact</p></div>
                   <textarea rows={2} placeholder="Home address..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900 resize-none mb-4" value={regData.address} onChange={(e) => setRegData({...regData, address: e.target.value})}/>
                   <div className="grid grid-cols-2 gap-3 pt-4">
                      <button onClick={() => setRegStep("PERSONAL")} className="py-5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Back</button>
                      <button onClick={() => setRegStep("INSURANCE")} className="py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">Next: Insurance <ChevronRight size={16} /></button>
                   </div>
                </motion.div>
              )}
              {regStep === "INSURANCE" && (
                <motion.div key="i" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">3</div><p className="text-sm font-black text-slate-900">Insurance & HMO Settings</p></div>
                   <div className="flex gap-2">
                      {["Private", "HMO"].map(type => (
                        <button key={type} onClick={() => setRegData({...regData, planType: type})} className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", regData.planType === type ? "bg-sky-600 border-sky-600 text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-400")}>{type}</button>
                      ))}
                   </div>
                   {regData.planType === "HMO" && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provider</label><input type="text" placeholder="e.g. Reliance" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900" value={regData.hmoProvider} onChange={(e) => setRegData({...regData, hmoProvider: e.target.value})} /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HMO ID</label><input type="text" placeholder="Policy number" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold text-slate-900" value={regData.hmoId} onChange={(e) => setRegData({...regData, hmoId: e.target.value})} /></div>
                       </motion.div>
                    )}
                   <div className="grid grid-cols-2 gap-3 pt-4">
                      <button onClick={() => setRegStep("CONTACT")} className="py-5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Back</button>
                      <button onClick={handleRegistration} disabled={isCheckInLoading} className="py-5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20">{isCheckInLoading ? <Loader2 size={16} className="animate-spin" /> : <>Register & Assign Queue <CheckCircle2 size={16} /></>}</button>
                   </div>
                </motion.div>
              )}
              {regStep === "SUCCESS" && (
                <motion.div key="s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
                   <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-6"><CheckCircle2 size={48} /></div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h2>
                   <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 max-w-sm mx-auto"><div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Patient ID</p><p className="text-3xl font-black text-sky-600">PT-2026-9042</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">{regData.planType} registration ready for queue assignment</p></div></div>
                   <button onClick={() => setIsRegModalOpen(false)} className="w-full py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Done</button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
}
