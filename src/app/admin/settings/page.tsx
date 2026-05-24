"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings2, Zap, Bell, MessageSquare, 
  Mail, Key, Globe, ShieldCheck, 
  CheckCircle2, AlertCircle, RefreshCw, 
  Smartphone, Database, Save, ArrowRight,
  ToggleLeft, ToggleRight, Laptop, Fingerprint,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const integrations = [
  { name: "WhatsApp Business API", provider: "Twilio", status: "Connected", icon: MessageSquare, color: "emerald" },
  { name: "SMS Gateway", provider: "BulkSMS", status: "Low Balance", icon: Smartphone, color: "amber" },
  { name: "Email Server", provider: "AWS SES", status: "Connected", icon: Mail, color: "blue" },
  { name: "Payment Gateway", provider: "Paystack", status: "Active", icon: Key, color: "brand-blue" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [features, setFeatures] = useState({
    aiDiagnostics: true,
    hmoAutomation: true,
    multiBranchSync: true,
    offlineMode: false,
    advancedImaging: true,
    telemedicine: false
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">System Control</h1>
          <p className="text-slate-500 font-medium mt-1">Configure global feature toggles, notifications, and API integrations.</p>
        </div>
        <Button variant="primary" className="gap-2 shadow-xl shadow-brand-blue/20">
          <Save size={18} /> Save Global Changes
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Toggles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-2">
              <Zap className="text-brand-blue" size={24} /> Platform Feature Toggles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(features).map(([key, value]) => (
                <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                  <div>
                    <p className="text-sm font-bold text-brand-navy capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-[10px] text-slate-500">Global activation for all clinics.</p>
                  </div>
                  <button 
                    onClick={() => toggleFeature(key as keyof typeof features)}
                    className={cn(
                      "transition-colors duration-300",
                      value ? "text-brand-blue" : "text-slate-300"
                    )}
                  >
                    {value ? <ToggleRight size={40} strokeWidth={1.5} /> : <ToggleLeft size={40} strokeWidth={1.5} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-2">
              <Bell className="text-brand-blue" size={24} /> Notification Templates
            </h3>
            <div className="space-y-4">
              {[
                { name: "Welcome Email", type: "Email", status: "Active" },
                { name: "Appointment Reminder", type: "WhatsApp", status: "Active" },
                { name: "HMO Verification Success", type: "SMS", status: "Active" },
                { name: "Lens Ready for Pickup", type: "WhatsApp/Email", status: "Draft" },
              ].map((template, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-navy">{template.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{template.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                      template.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>{template.status}</span>
                    <Button variant="ghost" size="sm" className="text-brand-blue font-bold text-xs p-0 hover:bg-transparent">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-brand-blue font-bold gap-2">
              Manage All Templates <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Integrations & API */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Active Integrations</h3>
            <div className="space-y-4">
              {integrations.map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", 
                      item.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                      item.color === "amber" ? "bg-amber-50 text-amber-500" :
                      item.color === "blue" ? "bg-blue-50 text-blue-500" : "bg-brand-soft-blue text-brand-blue"
                    )}>
                      <item.icon size={18} />
                    </div>
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                      item.status === "Connected" || item.status === "Active" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>{item.status}</span>
                  </div>
                  <p className="text-sm font-bold text-brand-navy">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Provider: {item.provider}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl font-bold gap-2">
              <Plus size={16} /> Add Integration
            </Button>
          </div>

          <div className="bg-brand-navy p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <Key size={32} className="text-brand-blue mb-6 relative z-10" />
            <h3 className="text-lg font-bold mb-2 relative z-10">System API Keys</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed relative z-10">
              Manage high-level API access for third-party developers and external health systems.
            </p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-6 relative z-10 flex items-center justify-between">
              <code className="text-[10px] font-mono text-slate-300">pk_live_******************</code>
              <button className="text-brand-blue hover:text-white transition-colors"><RefreshCw size={14} /></button>
            </div>
            <Button className="w-full bg-white text-brand-navy hover:bg-slate-50 font-bold rounded-xl text-sm py-5 relative z-10">
              Manage Webhooks
            </Button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">System Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Core Version</span>
                <span className="font-bold text-brand-navy text-right">v2.4.0-stable</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Last Deployment</span>
                <span className="font-bold text-brand-navy text-right">24 May 2026, 02:40 AM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Uptime</span>
                <span className="font-bold text-emerald-600 text-right">99.998%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
