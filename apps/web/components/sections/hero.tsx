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
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden hero-gradient">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            New: AI-Powered HMO Claims Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-brand-navy leading-tight mb-6">
            Modern Workflow <br />
            <span className="gradient-text">Automation</span> for <br />
            Eye Clinics
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
            Reduce queues, automate patient check-ins, manage HMOs, streamline optical operations, and run your entire eye clinic from one intelligent platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button variant="dark" size="lg" className="gap-2" onClick={() => openModal("demo")}>
              Request Demo <ChevronRight size={18} />
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={() => openModal("tour")}>
              <Play size={18} fill="currentColor" /> Watch Tour
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, text: "Multi-branch support" },
              { icon: FileText, text: "HMO Ready" },
              { icon: QrCode, text: "QR Self Check-in" },
              { icon: Activity, text: "Optical Workflow" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-500 font-medium">
                <item.icon size={18} className="text-brand-blue" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main Dashboard Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 relative z-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Activity className="text-brand-blue" size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-navy">Main Branch Dashboard</div>
                  <div className="text-[10px] text-slate-400">Live • Updated 2m ago</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Patients", value: "128", color: "text-blue-600" },
                { label: "Active Queue", value: "14", color: "text-amber-600" },
                { label: "Revenue", value: "$4.2k", color: "text-emerald-600" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-2xl">
                  <div className="text-[10px] text-slate-500 mb-1">{stat.label}</div>
                  <div className={cn("text-lg font-bold", stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Queue Status</div>
              {[
                { name: "John Doe", type: "Eye Exam", status: "In Room", time: "10:30 AM" },
                { name: "Jane Smith", type: "Lens Pickup", status: "Waiting", time: "10:45 AM" },
                { name: "Robert Fox", type: "Consultation", status: "Check-in", time: "11:00 AM" },
              ].map((patient, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-soft-blue flex items-center justify-center text-brand-blue text-[10px] font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-navy">{patient.name}</div>
                      <div className="text-[10px] text-slate-500">{patient.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1",
                      patient.status === "In Room" ? "bg-emerald-100 text-emerald-700" :
                      patient.status === "Waiting" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {patient.status}
                    </div>
                    <div className="text-[9px] text-slate-400">{patient.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 glass p-4 rounded-2xl z-20 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
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
            className="absolute -bottom-10 -left-10 glass p-5 rounded-2xl z-20 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-32">
                <span className="text-[10px] font-bold text-slate-500">Lens Production</span>
                <span className="text-[9px] text-brand-blue font-bold">85%</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: ["10%", "85%"] }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-brand-blue"
                />
              </div>
              <div className="text-[9px] text-slate-400">Progessive Lens • Lab #4</div>
            </div>
          </motion.div>

          {/* Background Decorations */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/10 blur-[100px] rounded-full"></div>
        </motion.div>
      </div>
    </section>
  );
};
