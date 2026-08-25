"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  Building2, Activity, Calendar, Download,
  Filter, PieChart, MousePointer2, Clock,
  ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PlatformAnalyticsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Platform Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Deep dive into platform growth, clinic performance, and user engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
            {["7D", "30D", "90D", "12M"].map((p) => (
              <button key={p} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", p === "30D" ? "bg-brand-navy text-white" : "text-slate-400 hover:text-brand-navy")}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("PDF Report clicked")}>
            <Download size={16} /> PDF Report
          </Button>
        </div>
      </div>

      {/* Growth & Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Revenue & Onboarding Growth</h2>
              <p className="text-xs text-slate-500">MRR and new clinics joined per month</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-2xl font-black text-brand-navy">$142k</p>
                <p className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1 uppercase tracking-tighter">
                  MRR <ArrowUpRight size={12} /> +12%
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-brand-navy">110</p>
                <p className="text-[10px] font-bold text-brand-blue flex items-center justify-end gap-1 uppercase tracking-tighter">
                  New Clinics <ArrowUpRight size={12} /> +24%
                </p>
              </div>
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="h-64 w-full flex items-end gap-3 px-4 relative">
            {/* Legend */}
            <div className="absolute top-0 right-4 flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-brand-soft-blue rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500">Onboarding</span>
              </div>
            </div>
            {[40, 65, 35, 80, 55, 90, 70, 85, 100, 75, 95, 110].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div className="w-full flex flex-col-reverse items-end h-full gap-0.5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-brand-soft-blue group-hover/bar:bg-brand-blue/50 rounded-t-sm transition-all relative"
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val * 0.6}%` }}
                    transition={{ duration: 1, delay: i * 0.05 + 0.2 }}
                    className="w-full bg-brand-blue rounded-t-sm transition-all relative"
                  />
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full"></div>
            <h3 className="text-lg font-bold mb-6">Revenue by Plan Type</h3>
            <div className="space-y-6">
              {[
                { label: "Starter", val: "$18.5k", perc: 15, color: "slate-400" },
                { label: "Growth", val: "$64.2k", perc: 45, color: "brand-blue" },
                { label: "Enterprise", val: "$59.8k", perc: 40, color: "emerald-400" },
              ].map((plan, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{plan.label}</span>
                    <span>{plan.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.perc}%` }}
                      className={cn("h-full rounded-full", 
                        plan.color === "brand-blue" ? "bg-brand-blue" : 
                        plan.color === "emerald-400" ? "bg-emerald-400" : "bg-slate-400"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-4 text-center">ARPU</h3>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-brand-navy">$1,295</div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">+5.4% VS LAST QTR</p>
              <p className="text-[10px] text-slate-400 font-medium mt-4 text-center uppercase tracking-tighter">Average Revenue Per Unit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic & Retention Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Clinics */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-brand-navy">Top Clinics by Volume</h3>
            <Button variant="ghost" size="sm" className="text-brand-blue font-bold text-xs">View Ranking</Button>
          </div>
          <div className="space-y-4">
            {[
              { name: "ClearVision Eye Clinic", patients: "1,240", growth: "+12%", health: 98 },
              { name: "Lagos Vision Center", patients: "980", growth: "+8%", health: 95 },
              { name: "Optimal Optical", patients: "850", growth: "+15%", health: 92 },
              { name: "Precision Eyecare", patients: "720", growth: "+5%", health: 88 },
            ].map((clinic, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-blue/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sm font-black text-brand-navy shadow-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">{clinic.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{clinic.patients} patients • {clinic.growth} growth</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">Health Score</div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${clinic.health}%` }} />
                    </div>
                    <span className="text-xs font-bold text-brand-navy">{clinic.health}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Adoption & Retention */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-brand-navy">Feature Adoption</h3>
            <Button variant="ghost" size="sm" className="text-brand-blue font-bold text-xs">Full Audit</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "HMO Module", val: "94%", desc: "High engagement", color: "emerald" },
              { label: "Optical Shop", val: "72%", desc: "Growing", color: "brand-blue" },
              { label: "Inventory", val: "45%", desc: "Underused", color: "amber" },
              { label: "Reports", val: "88%", desc: "Essential", color: "purple" },
            ].map((feat, i) => (
              <div key={i} className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 text-center">
                <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 font-black text-lg", 
                  feat.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                  feat.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue" :
                  feat.color === "amber" ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
                )}>
                  {feat.val}
                </div>
                <h4 className="text-sm font-bold text-brand-navy mb-1">{feat.label}</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{feat.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-brand-soft-blue/30 rounded-[2rem] border border-brand-soft-blue flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-brand-blue uppercase tracking-widest mb-1">User Retention (90D)</p>
              <h4 className="text-2xl font-black text-brand-navy">88.4%</h4>
            </div>
            <Activity className="text-brand-blue animate-pulse" size={32} />
          </div>
        </div>
      </div>

      {/* Regional & Device Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Top Region", val: "Lagos, NG", icon: Globe, color: "blue" },
          { label: "Peak Activity", val: "Mon - Wed", icon: Clock, color: "purple" },
          { label: "Primary Device", val: "Desktop (84%)", icon: MousePointer2, color: "emerald" },
          { label: "Clinic Retention", val: "99.2%", icon: Activity, color: "brand-blue" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", 
              item.color === "blue" ? "bg-blue-50 text-blue-500" :
              item.color === "purple" ? "bg-purple-50 text-purple-500" :
              item.color === "emerald" ? "bg-emerald-50 text-emerald-500" : "bg-brand-soft-blue text-brand-blue"
            )}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h4 className="text-lg font-black text-brand-navy">{item.val}</h4>
          </div>
        ))}
      </div>

      {/* Popular Modules */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold text-brand-navy mb-8">Most Used Modules (Daily Hits)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "HMO Claims", hits: "45.2k", trend: "+5.1%" },
            { name: "Optical Orders", hits: "32.8k", trend: "+8.4%" },
            { name: "Patient Check-in", hits: "28.4k", trend: "+2.2%" },
            { name: "Pharmacy Dispense", hits: "14.1k", trend: "-1.5%" },
          ].map((mod, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
              <h4 className="text-sm font-black text-slate-700 mb-2">{mod.name}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-navy">{mod.hits}</span>
                <span className={cn("text-[10px] font-bold", mod.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500")}>
                  {mod.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
