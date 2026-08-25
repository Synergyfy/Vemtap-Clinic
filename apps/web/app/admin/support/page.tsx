"use client";

import React, { useState } from "react";
import { 
  Ticket, AlertCircle, Search, Plus, MoreVertical, 
  CheckCircle2, Clock, User, Building2, ShieldAlert, 
  Zap, MessageCircle, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModals } from "@/lib/modal-context";

const tickets = [
  { id: "TKT-1042", subject: "Unable to verify HMO card", clinic: "ClearVision VI", user: "Receptionist Mary", priority: "High", status: "Open", time: "12m ago", type: "Ticket" },
  { id: "TKT-1041", subject: "Lens inventory sync error", clinic: "Lagos Vision Center", user: "Optician John", priority: "Medium", status: "Pending", time: "45m ago", type: "Ticket" },
  { id: "CMP-2001", subject: "Unprofessional staff behavior", clinic: "Precision Eyecare", user: "Patient A. Bello", priority: "High", status: "Open", time: "1h ago", type: "Complaint" },
  { id: "TKT-1040", subject: "Custom template request", clinic: "Precision Eyecare", user: "Dr. David", priority: "Low", status: "Open", time: "2h ago", type: "Ticket" },
  { id: "CMP-2002", subject: "Overcharging for frames", clinic: "Optimal Optical", user: "Patient C. Okafor", priority: "Critical", status: "Open", time: "3h ago", type: "Complaint" },
];

const incidentLogs = [
  { id: "INC-901", incident: "Paystack Gateway Timeout", severity: "High", time: "10m ago", status: "Investigating" },
  { id: "INC-900", incident: "HMO API Latency", severity: "Medium", time: "2h ago", status: "Resolved" },
];

export default function SupportDashboardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { openModal } = useModals();

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "complaints") return t.type === "Complaint";
    if (activeTab === "tickets") return t.type === "Ticket";
    return t.status.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Support Desk</h1>
          <p className="text-slate-500 font-medium mt-1">Manage platform-wide tickets, complaints, and system incidents.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => openModal("incident-log")}>
            <ShieldAlert size={16} /> View Incident Logs
          </Button>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => openModal("broadcast")}>
            <Plus size={16} /> Broadcast Memo
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Open Tickets", val: "14", icon: Ticket, color: "blue" },
          { label: "Active Complaints", val: "5", icon: AlertCircle, color: "rose" },
          { label: "System Uptime", val: "99.9%", icon: Zap, color: "emerald" },
          { label: "Active Chats", val: "6", icon: MessageCircle, color: "brand-blue" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
              stat.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white" :
              "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-brand-navy">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Main Support Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tickets & Complaints List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative flex-1 w-full max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={16} />
              <input type="text" placeholder="Search support..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {["all", "tickets", "complaints", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveTab(s)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    activeTab === s ? "bg-brand-navy text-white" : "text-slate-400 hover:text-brand-navy hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filteredTickets.map((t, i) => (
                <div key={i} className="p-6 hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => openModal("ticket")}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        t.type === "Complaint" ? "bg-rose-50 text-rose-500" :
                        t.priority === "Critical" ? "bg-rose-50 text-rose-500" :
                        t.priority === "High" ? "bg-amber-50 text-amber-500" :
                        t.priority === "Medium" ? "bg-blue-50 text-blue-500" : "bg-slate-100 text-slate-500"
                      )}>
                        {t.type === "Complaint" ? <AlertCircle size={20} /> : <Ticket size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors">{t.subject}</h4>
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                            t.type === "Complaint" ? "bg-rose-600 text-white" :
                            t.priority === "Critical" ? "bg-rose-600 text-white" :
                            t.priority === "High" ? "bg-amber-500 text-white" :
                            t.priority === "Medium" ? "bg-blue-500 text-white" : "bg-slate-400 text-white"
                          )}>
                            {t.type === "Complaint" ? "Complaint" : t.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1"><Building2 size={12} /> {t.clinic}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {t.user}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {t.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        t.status === "Resolved" ? "bg-emerald-50 text-emerald-600" :
                        t.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {t.status === "Resolved" ? <CheckCircle2 size={12} /> : 
                         t.status === "Pending" ? <Clock size={12} /> : <AlertCircle size={12} />}
                        {t.status}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <MoreVertical size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center font-bold text-xs text-slate-400">
              Page 1 of 12 • Showing {filteredTickets.length} items
            </div>
          </div>
        </div>

        {/* Support Tools & Incident Monitoring */}
        <div className="space-y-6">
          {/* Active Incident Feed */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-navy">Active Incidents</h3>
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </div>
            </div>
            <div className="space-y-4">
              {incidentLogs.map((inc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-brand-navy">{inc.incident}</h4>
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                      inc.severity === "High" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>{inc.severity}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-slate-400 font-bold">{inc.time} • {inc.status}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-brand-blue p-0">Details</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl text-xs font-bold border-slate-200" onClick={() => openModal("incident-log")}>Full Incident Logs</Button>
          </div>

          <div className="bg-brand-navy p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full"></div>
            <h3 className="text-lg font-bold mb-6 relative z-10">Live Support Chat</h3>
            <div className="space-y-4 mb-8 relative z-10">
              {[
                { name: "Dr. Sarah", msg: "Hey, we're having trouble...", time: "2m" },
                { name: "Receptionist Mary", msg: "Is the HMO server down?", time: "5m" },
              ].map((chat, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-white/20">
                      {chat.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{chat.name}</p>
                      <p className="text-[10px] text-slate-400 truncate w-32">{chat.msg}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{chat.time}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl text-sm py-5" onClick={() => openModal("chat-console")}>
              Launch Chat Console
            </Button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Staff Performance</h3>
            <div className="space-y-4">
              {[
                { name: "Admin Tunde", solved: 12, rating: "4.8" },
                { name: "Support Chinwe", solved: 9, rating: "4.9" },
                { name: "Dev Mike", solved: 4, rating: "4.7" },
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-bold text-brand-blue border border-slate-100">
                      {staff.name.split(" ")[1][0]}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{staff.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-brand-navy">{staff.solved} Solved</p>
                    <p className="text-[10px] text-brand-blue font-bold">★ {staff.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
