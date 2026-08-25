"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, TrendingUp, PieChart, FileText } from "lucide-react";

export const HMOManagement = () => {
  return (
    <section id="solutions" className="py-24 bg-brand-navy text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-brand-blue/5 blur-[100px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            {/* Analytics Dashboard Mockup */}
            <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-bold">HMO Analytics</h4>
                  <p className="text-[10px] text-slate-400">Total Receivables Dashboard</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-medium border border-white/10">Last 30 Days</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Approved Claims</span>
                  </div>
                  <div className="text-2xl font-bold">$42,850.00</div>
                  <div className="text-[9px] text-emerald-400 mt-1">+12.5% from last month</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart size={14} className="text-amber-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pending HMOs</span>
                  </div>
                  <div className="text-2xl font-bold">$18,200.00</div>
                  <div className="text-[9px] text-amber-400 mt-1">8 Claims awaiting review</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue Breakdown</div>
                {[
                  { name: "Reliance Health", percent: 65, color: "bg-brand-blue" },
                  { name: "AXA Mansard", percent: 45, color: "bg-blue-400" },
                  { name: "Private Patients", percent: 85, color: "bg-emerald-400" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span>{item.name}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percent}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-brand-blue rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div className="text-xs font-bold">Generate Monthly HMO Report</div>
                </div>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-10 -left-10 glass-dark p-4 rounded-2xl border border-white/10 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="text-emerald-400" size={16} />
                </div>
                <div className="text-xs font-bold">100% Claim Accuracy</div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-sm font-semibold mb-6">
              HMO Operations
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Built for <span className="text-brand-blue">HMO & Private</span> Patient Operations
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Managing HMOs shouldn't be a headache. Vemtap provides end-to-end tracking for claims, revenue analytics, and comparison tools to keep your clinic profitable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Revenue Tracking", desc: "Real-time tracking of HMO vs Private revenue." },
                { title: "Claims Management", desc: "Automated claim submission and status tracking." },
                { title: "HMO Analytics", desc: "Detailed breakdown of performance per HMO provider." },
                { title: "Expected Receivables", desc: "Never lose track of what you are owed by providers." },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-brand-blue/50 transition-colors group">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                    <BarChart3 className="text-brand-blue" size={20} />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
