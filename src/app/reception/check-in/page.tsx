"use client";

import React, { useState } from "react";
import { 
  QrCode, 
  Search, 
  ChevronRight, 
  Eye, 
  Glasses, 
  ShoppingCart, 
  PackageCheck, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Loader2,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type CheckInStep = "START" | "IDENTIFY" | "PURPOSE" | "PLAN" | "VERIFYING" | "COMPLETE";

export default function CheckInPage() {
  const [step, setStep] = useState<CheckInStep>("START");
  const [patientId, setPatientId] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setIsLoading(true);
    // Simulate lookup
    setTimeout(() => {
      setIsLoading(false);
      setStep("IDENTIFY");
    }, 1500);
  };

  const purposes = [
    { id: "consult", label: "Eye Consultation", icon: Eye, desc: "Doctor's examination" },
    { id: "test", label: "Eye Test / Refraction", icon: Glasses, desc: "Check your vision" },
    { id: "lens_purchase", label: "Lens Purchase", icon: ShoppingCart, desc: "Buy prescription lenses" },
    { id: "frame_selection", label: "Frame Selection", icon: Glasses, desc: "Choose eyewear frames" },
    { id: "pickup", label: "Lens Pickup", icon: PackageCheck, desc: "Collect ready lenses" },
    { id: "followup", label: "Follow-up Visit", icon: Clock, desc: "Review progress" },
    { id: "emergency", label: "Emergency Care", icon: AlertCircle, desc: "Urgent attention", color: "text-rose-600" },
  ];

  const plans = [
    { id: "hmo", label: "HMO Patient", icon: ShieldCheck, desc: "Reliance, Axa, etc." },
    { id: "private", label: "Private Patient", icon: CreditCard, desc: "Cash/Card/Transfer" },
  ];

  const handleFinalCheckIn = () => {
    setStep("VERIFYING");
    setTimeout(() => {
      setStep("COMPLETE");
    }, 2500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {step === "START" && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 text-center space-y-12"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-sky-50 rounded-[2rem] flex items-center justify-center mx-auto text-sky-600">
                  <QrCode size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Patient Check-In</h1>
                <p className="text-slate-500 font-medium text-lg">Scan your QR code or enter your Patient ID to begin.</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <form onSubmit={handleIdSubmit} className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={24} />
                  <input 
                    type="text" 
                    placeholder="Enter Patient ID (e.g. PT-2024-001)"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-sky-500/20 focus:bg-white focus:outline-none transition-all text-xl font-bold text-slate-900 placeholder:text-slate-300"
                  />
                  <button 
                    disabled={isLoading}
                    className="absolute right-3 top-3 bottom-3 px-6 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Start"}
                  </button>
                </form>

                <div className="flex items-center gap-4 text-slate-300">
                   <div className="h-[1px] flex-1 bg-current" />
                   <span className="text-xs font-black uppercase tracking-widest">OR</span>
                   <div className="h-[1px] flex-1 bg-current" />
                </div>

                <div className="p-8 rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4 group cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                    <QrCode size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 group-hover:text-sky-600 transition-colors">Point Camera at QR Code</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "IDENTIFY" && (
            <motion.div 
              key="identify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <button onClick={() => setStep("START")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back
              </button>
              
              <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-sky-50 border border-sky-100 mb-12">
                <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-sky-600 text-3xl font-black">
                  CO
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Chidimma Okoro</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                    <UserCheck size={14} className="text-sky-500" /> Patient ID: {patientId || "PT-2024-001"}
                  </p>
                </div>
                <div className="ml-auto px-6 py-3 bg-white rounded-2xl border border-sky-100 shadow-sm text-sky-600 font-black text-sm uppercase tracking-widest">
                  Returning Patient
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 px-2">Is this you?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setStep("PURPOSE")}
                    className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-between group hover:bg-slate-800 transition-all"
                  >
                    <span className="text-xl font-bold">Yes, proceed to check-in</span>
                    <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setStep("START")}
                    className="p-8 rounded-[2.5rem] border-2 border-slate-100 text-slate-400 flex items-center justify-between hover:border-rose-100 hover:text-rose-500 transition-all"
                  >
                    <span className="text-xl font-bold">No, that&apos;s not me</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "PURPOSE" && (
            <motion.div 
              key="purpose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <button onClick={() => setStep("IDENTIFY")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back
              </button>

              <div className="mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purpose of Visit</h2>
                <p className="text-slate-500 font-medium">Please select the reason for your visit today.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purposes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPurpose(p.label);
                      setStep("PLAN");
                    }}
                    className="p-6 rounded-[2rem] border border-slate-100 hover:border-sky-500/20 hover:bg-sky-50 transition-all group text-left"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-400 group-hover:bg-white group-hover:text-sky-600 transition-all", p.color)}>
                      <p.icon size={24} />
                    </div>
                    <h3 className="font-black text-slate-900 mb-1">{p.label}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{p.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "PLAN" && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <button onClick={() => setStep("PURPOSE")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back
              </button>

              <div className="mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Method</h2>
                <p className="text-slate-500 font-medium">How are you paying for your visit?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlan(p.label);
                      handleFinalCheckIn();
                    }}
                    className="p-10 rounded-[2.5rem] border border-slate-100 hover:border-sky-500/20 hover:bg-sky-50 transition-all group flex flex-col items-center text-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-sky-600 transition-all">
                      <p.icon size={40} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{p.label}</h3>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "VERIFYING" && (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3.5rem] p-20 border border-slate-100 shadow-2xl shadow-slate-200/50 text-center space-y-8"
            >
              <div className="relative w-32 h-32 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-sky-600"
                />
                <div className="absolute inset-0 flex items-center justify-center text-sky-600">
                  <ShieldCheck size={48} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Finalizing Check-In</h2>
                <p className="text-slate-500 font-medium italic">We&apos;re verifying your HMO and assigning your queue ticket...</p>
              </div>
            </motion.div>
          )}

          {step === "COMPLETE" && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 text-center"
            >
              <div className="mb-12">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Check-In Successful!</h2>
                <p className="text-slate-500 font-medium">Your ticket has been generated. Please take your seat.</p>
              </div>

              <div className="max-w-sm mx-auto p-8 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 mb-12 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/50 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Ticket</p>
                    <p className="text-6xl font-black text-slate-900">V-024</p>
                  </div>
                  <div className="space-y-2 text-left border-t border-slate-200 pt-6">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Patient</span>
                      <span className="text-xs font-black text-slate-900">Chidimma Okoro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Purpose</span>
                      <span className="text-xs font-black text-slate-900">{selectedPurpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Plan</span>
                      <span className="text-xs font-black text-slate-900">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Time</span>
                      <span className="text-xs font-black text-slate-900">10:42 AM</span>
                    </div>
                  </div>
                  <QrCode className="mx-auto text-slate-900 opacity-20" size={80} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                  <Printer size={18} /> Print Ticket
                </button>
                <button 
                  onClick={() => {
                    setStep("START");
                    setPatientId("");
                  }}
                  className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
