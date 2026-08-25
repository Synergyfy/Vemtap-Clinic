"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, ShieldCheck, Lock, Eye, 
  Search, Filter, Download, MoreVertical,
  Activity, Globe, Smartphone, Monitor,
  Key, UserCheck, AlertTriangle, ListTodo,
  FileCheck, History, RefreshCw, LogIn,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const auditLogs = [
  { id: "LOG-592", user: "Admin Tunde", action: "Updated HMO Tariff", target: "Reliance HMO", date: "10m ago", ip: "192.168.1.1", status: "Success" },
  { id: "LOG-591", user: "Dr. Sarah", action: "Deleted Patient Record", target: "PT-092", date: "25m ago", ip: "102.89.34.12", status: "Warning" },
  { id: "LOG-590", user: "Super Admin", action: "Changed Feature Toggle", target: "AI Diagnostics", date: "1h ago", ip: "System", status: "Success" },
  { id: "LOG-589", user: "Receptionist Mary", action: "Failed Login Attempt", target: "Login Portal", date: "2h ago", ip: "41.203.78.5", status: "Failed" },
  { id: "LOG-588", user: "Clinic Admin", action: "Exported Revenue Data", target: "Finance Module", date: "3h ago", ip: "197.210.8.22", status: "Success" },
];

export default function SecurityDashboardPage() {
  const [activeView, setActiveView] = useState("logs");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Security & Audit</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor system integrity, user activity, and compliance standards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Compliance Report
          </Button>
          <Button variant="primary" size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700 shadow-rose-200">
            <ShieldAlert size={16} /> Emergency Lockdown
          </Button>
        </div>
      </div>

      {/* Security Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Security Score", val: "98/100", icon: ShieldCheck, color: "emerald", desc: "Optimal Health" },
          { label: "Active Sessions", val: "1,242", icon: Activity, color: "blue", desc: "Across 542 clinics" },
          { label: "Failed Logins", val: "14", icon: AlertTriangle, color: "amber", desc: "Last 24 hours" },
          { label: "Data Integrity", val: "Verified", icon: FileCheck, color: "brand-blue", desc: "Sync check passed" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", 
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                stat.color === "blue" ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                stat.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white" :
                "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
              )}>
                <stat.icon size={24} />
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <RefreshCw size={14} className="text-slate-300 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-brand-navy mb-1">{stat.val}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-brand-navy">Platform Audit Logs</h2>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
              {["logs", "sessions", "threats"].map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeView === v ? "bg-white text-brand-navy shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Filter logs..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 w-64" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter size={14} /> Advanced
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event / Action</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        log.status === "Success" ? "bg-emerald-50 text-emerald-500" :
                        log.status === "Warning" ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"
                      )}>
                        <ListTodo size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-navy">{log.action}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Target: {log.target}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                        {log.user[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-mono text-slate-500">{log.ip}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                      log.status === "Success" ? "text-emerald-600" :
                      log.status === "Warning" ? "text-amber-600" : "text-rose-600"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        log.status === "Success" ? "bg-emerald-500" :
                        log.status === "Warning" ? "bg-amber-500" : "bg-rose-500"
                      )}></div>
                      {log.status}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-400 font-medium">{log.date}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
          <Button variant="ghost" size="sm" className="text-brand-blue font-bold gap-2">
            View Extended History <History size={16} />
          </Button>
        </div>
      </div>

      {/* Compliance & Security Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-navy p-10 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between mb-8 relative z-10">
            <Lock size={40} className="text-brand-blue" />
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Status</p>
              <h3 className="text-2xl font-black text-emerald-400">FULLY COMPLIANT</h3>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
            Platform meets all HIPAA and GDPR healthcare data protection standards. All patient data is encrypted at rest and in transit. Monthly security audits are active.
          </p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold mb-1">Last Audit</p>
              <p className="text-sm font-black text-brand-blue">May 15, 2026</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold mb-1">Next Audit</p>
              <p className="text-sm font-black text-brand-blue">June 15, 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy">Active Sessions</h3>
                <p className="text-xs text-slate-500">Currently active platform users.</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { browser: "Chrome / Windows", user: "Dr. Sarah", location: "Lagos, NG", icon: Monitor },
                { browser: "Safari / iOS", user: "Mary", location: "Abuja, NG", icon: Smartphone },
                { browser: "Firefox / macOS", user: "Super Admin", location: "Remote", icon: Globe },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-blue/30 transition-all">
                  <div className="flex items-center gap-4">
                    <session.icon size={20} className="text-slate-400 group-hover:text-brand-blue transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{session.user}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{session.browser} • {session.location}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50">Revoke</Button>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full mt-8 rounded-xl font-bold gap-2 border-slate-200">
            View All Active Sessions <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
