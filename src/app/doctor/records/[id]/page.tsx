"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Eye, ClipboardCheck, 
  Download, Printer, ChevronRight, Calendar,
  Activity, Pill, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicPatients } from "@/app/clinic/_mock/clinic-data";
import { cn } from "@/lib/utils";

export default function PatientRecordDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const patient = clinicPatients.find(p => p.id === id) || clinicPatients[0];

  const encounters = [
    { 
      id: "ENC-992", 
      date: "June 18, 2026", 
      type: "Consultation", 
      provider: "Dr. A. Bello",
      diagnosis: "Allergic Conjunctivitis",
      plan: "Prescribed Patanol eye drops, review in 1 week.",
      status: "Open"
    },
    { 
      id: "ENC-841", 
      date: "May 24, 2026", 
      type: "Eye Test", 
      provider: "Optom. S. Danladi",
      diagnosis: "Myopia OU",
      plan: "Proceeded to lens selection. Prescribed -2.50DS OU.",
      status: "Closed"
    },
    { 
      id: "ENC-720", 
      date: "April 10, 2026", 
      type: "Pharmacy", 
      provider: "Pharm. T. Ibrahim",
      diagnosis: "Medication Dispensed",
      plan: "Dispensed Artificial Tears x2.",
      status: "Closed"
    }
  ];

  const filteredEncounters = activeTab === "all" 
    ? encounters 
    : encounters.filter(e => e.type.toLowerCase().includes(activeTab.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
              <Badge className="bg-slate-900 text-white border-none px-3 py-1 text-xs font-black uppercase tracking-widest">{patient.id}</Badge>
            </div>
            <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
              <User size={16} className="text-emerald-500" />
              {patient.age} years • {patient.sex} • {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={18} />
            Print Full Record
          </button>
          <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Patient Summary */}
        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Blood Group</p>
                <p className="text-lg font-black text-slate-900">O Positive (O+)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Known Allergies</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-rose-100 text-rose-700 border-none font-bold">Penicillin</Badge>
                  <Badge className="bg-rose-100 text-rose-700 border-none font-bold">Pollen</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Refraction</p>
                <p className="text-sm font-bold text-slate-900 mt-1">May 24, 2026 (-2.50DS OU)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200/50">
            <CardContent className="p-8">
              <Activity size={32} className="mb-4 text-emerald-200" />
              <h3 className="text-xl font-black mb-2">HMO Coverage</h3>
              <p className="text-emerald-100 text-sm font-bold mb-6 italic leading-relaxed">
                Patient is currently covered under AXA Mansard Gold Plan. No pending authorizations.
              </p>
              <button className="w-full py-3 rounded-2xl bg-white text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
                View Policy Details
              </button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Records Timeline */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
            {[
              { id: "all", label: "All Encounters" },
              { id: "consult", label: "Consultations" },
              { id: "test", label: "Tests" },
              { id: "pharm", label: "Pharmacy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredEncounters.map((e, index) => (
              <Card key={e.id} className="rounded-[2rem] border-slate-200 hover:border-emerald-200 transition-all cursor-pointer group shadow-lg shadow-slate-100/50 overflow-hidden">
                <div className="flex items-stretch">
                  <div className={cn(
                    "w-2 transition-all",
                    e.status === "Open" ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                  <CardContent className="p-0 flex-1">
                    <div className="p-6 flex items-start justify-between">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          {e.type === "Consultation" && <FileText size={24} />}
                          {e.type === "Eye Test" && <Eye size={24} />}
                          {e.type === "Pharmacy" && <Pill size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-slate-900">{e.type}</h3>
                            <Badge variant="outline" className="text-[10px] font-mono text-slate-400">{e.id}</Badge>
                            {e.status === "Open" && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase">Active Session</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2">
                            <Calendar size={12} className="text-slate-300" />
                            {e.date} • {e.provider}
                          </p>
                        </div>
                      </div>
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis / Findings</p>
                          <p className="text-sm font-bold text-slate-800">{e.diagnosis}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management Plan</p>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium">{e.plan}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
