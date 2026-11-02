"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Play, Users, Calendar, Activity, QrCode, FileText, ChevronRight } from "lucide-react";
import { useModals } from "@/lib/modal-context";

export const Hero = () => {
  const { openModal } = useModals();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 hero-gradient">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue/10 bg-brand-blue/10 px-3 py-1.5 text-[11px] font-semibold text-brand-blue sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-blue"></span>
            </span>
            New: AI-Powered HMO Claims Management
          </div>

          <h1 className="mb-5 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-brand-navy sm:text-5xl md:text-6xl lg:text-7xl">
            Modern Workflow <br className="hidden sm:block" />
            <span className="gradient-text">Automation</span> for <br className="hidden sm:block" />
            Eye Clinics
          </h1>

          <p className="mb-7 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
            Reduce queues, automate patient check-ins, manage HMOs, streamline optical operations, and run your entire eye clinic from one intelligent platform.
          </p>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="default" size="lg" className="w-full gap-2 justify-center sm:w-auto" onClick={() => openModal("demo")}>
              Request Demo <ChevronRight size={18} />
            </Button>
            <Button variant="outline" size="lg" className="w-full gap-2 justify-center sm:w-auto" onClick={() => openModal("tour")}>
              <Play size={18} fill="currentColor" /> Watch Tour
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: Users, text: "Multi-branch support" },
              { icon: FileText, text: "HMO Ready" },
              { icon: QrCode, text: "QR Self Check-in" },
              { icon: Activity, text: "Optical Workflow" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:px-3.5">
                <item.icon size={16} className="shrink-0 text-brand-blue" />
                <span className="leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full"
        >
          {/* Main Dashboard Card */}
          <div className="relative z-10 overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.12)] sm:p-6 lg:rounded-[2rem]">
            <div className="mb-5 flex items-center justify-between sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 sm:h-10 sm:w-10">
                  <Activity className="text-brand-blue" size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy sm:text-sm">Main Branch Dashboard</div>
                  <div className="text-[9px] text-slate-400 sm:text-[10px]">Live • Updated 2m ago</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-100"></div>
                <div className="h-2 w-2 rounded-full bg-slate-100"></div>
                <div className="h-2 w-2 rounded-full bg-slate-100"></div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-4 sm:mb-6">
              {[
                { label: "Patients", value: "128", color: "text-blue-600" },
                { label: "Active Queue", value: "14", color: "text-amber-600" },
                { label: "Revenue", value: "$4.2k", color: "text-emerald-600" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-50 p-2.5 sm:p-3">
                  <div className="mb-1 text-[9px] text-slate-500 sm:text-[10px]">{stat.label}</div>
                  <div className={cn("text-base font-bold sm:text-lg", stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">Live Queue Status</div>
              {[
                { name: "John Doe", type: "Eye Exam", status: "In Room", time: "10:30 AM" },
                { name: "Jane Smith", type: "Lens Pickup", status: "Waiting", time: "10:45 AM" },
                { name: "Robert Fox", type: "Consultation", status: "Check-in", time: "11:00 AM" },
              ].map((patient, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-50 bg-white p-2.5 shadow-sm sm:p-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft-blue text-[9px] font-bold text-brand-blue sm:h-8 sm:w-8 sm:text-[10px]">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-brand-navy sm:text-xs">{patient.name}</div>
                      <div className="text-[9px] text-slate-500 sm:text-[10px]">{patient.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "mb-1 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:text-[10px]",
                      patient.status === "In Room" ? "bg-emerald-100 text-emerald-700" :
                      patient.status === "Waiting" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {patient.status}
                    </div>
                    <div className="text-[8px] text-slate-400 sm:text-[9px]">{patient.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-2 -top-4 z-20 hidden rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xl backdrop-blur-sm sm:block sm:-right-6 sm:-top-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="text-emerald-600" size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500">HMO Claim Approved</div>
                <div className="text-xs font-bold text-brand-navy">Relianze Health • $450.00</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-4 z-20 hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-2xl backdrop-blur-sm sm:block sm:-bottom-10 sm:-left-10"
          >
            <div className="flex flex-col gap-2">
              <div className="flex w-32 items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Lens Production</span>
                <span className="text-[9px] font-bold text-brand-blue">85%</span>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  animate={{ width: ["10%", "85%"] }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-brand-blue"
                />
              </div>
              <div className="text-[9px] text-slate-400">Progressive Lens • Lab #4</div>
            </div>
          </motion.div>

          {/* Background Decorations */}
          <div className="absolute -z-10 left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-[100px]"></div>
        </motion.div>
      </div>
    </section>
  );
};
