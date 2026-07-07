"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, History, Eye, ClipboardCheck, 
  FileText, Calendar, ArrowLeft, Save,
  ChevronRight, Activity, ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { clinicPatients } from "@/app/clinic/_mock/clinic-data";
import { ClinicalImagingGallery } from "../_components/ImagingGallery";

// Placeholder components for the workspace tabs
const ConsultationNotes = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-slate-900">Chief Complaint & History</h3>
    <textarea 
      className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
      placeholder="Type patient's complaints and clinical history here..."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Medical History</label>
        <textarea className="w-full h-24 p-3 rounded-lg border border-slate-200 outline-none" placeholder="Allergies, chronic conditions..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Family History</label>
        <textarea className="w-full h-24 p-3 rounded-lg border border-slate-200 outline-none" placeholder="Glaucoma, diabetes..." />
      </div>
    </div>
  </div>
);

const EyeExamination = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">Ocular Examination</h3>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">OD (Right Eye)</Badge>
        <Badge variant="outline" className="text-sky-700 border-sky-200 bg-sky-50">OS (Left Eye)</Badge>
      </div>
    </div>
    
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity size={16} className="text-emerald-600" />
            Visual Acuity (VA)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Right Eye (OD)</p>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Unaided" className="p-2 rounded border text-sm" />
                <input placeholder="Aided" className="p-2 rounded border text-sm" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Left Eye (OS)</p>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Unaided" className="p-2 rounded border text-sm" />
                <input placeholder="Aided" className="p-2 rounded border text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Eye size={16} className="text-sky-600" />
            Refraction & IOP
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Intraocular Pressure (IOP)</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400">OD (mmHg)</label>
                  <input type="number" className="w-full p-2 rounded border text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400">OS (mmHg)</label>
                  <input type="number" className="w-full p-2 rounded border text-sm" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slit Lamp / Anterior Segment</p>
              <textarea className="w-full h-20 p-2 rounded border text-sm" placeholder="Findings..." />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <ClinicalImagingGallery />
  </div>
);

const DiagnosisPrescription = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Diagnosis & Optical Rx</h3>
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Diagnosis</label>
        <input className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-900" placeholder="Enter primary diagnosis..." />
      </div>
      
      {/* Optical Rx Grid */}
      <Card className="border-emerald-100 bg-emerald-50/20 rounded-2xl shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-800">Optical Prescription (Rx)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-3 text-center">
            <div />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SPH</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CYL</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AXIS</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ADD</p>
            
            <p className="text-xs font-black text-slate-600 self-center uppercase">OD</p>
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
            
            <p className="text-xs font-black text-slate-600 self-center uppercase">OS</p>
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0" />
            <input className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Management Plan</label>
        <textarea className="w-full h-32 p-4 rounded-2xl border border-slate-200 outline-none font-medium text-slate-700" placeholder="Surgical plan, lifestyle advice, next steps..." />
      </div>
    </div>
  </div>
);

export default function ConsultationWorkspace() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notes");
  
  const patient = clinicPatients.find(p => p.id === id) || clinicPatients[0];

  const tabs = [
    { id: "notes", label: "Consultation Notes", icon: FileText },
    { id: "exam", label: "Eye Examination", icon: Eye },
    { id: "diagnosis", label: "Diagnosis & Rx", icon: ClipboardCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <Badge variant="outline" className="bg-slate-100">{patient.id}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {patient.age} years • {patient.sex} • {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
            <History size={18} />
            History
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
            <Save size={18} />
            Complete Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Context */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Visit Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Visit Purpose</p>
                <p className="text-sm font-semibold text-slate-900">General Consultation</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">HMO Status</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Verified</Badge>
                  <span className="text-xs text-slate-500">AXA Mansard</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Vitals (from Nurse)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-500">BP</p>
                    <p className="text-xs font-bold text-slate-900">120/80</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-500">Temp</p>
                    <p className="text-xs font-bold text-slate-900">36.8°C</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Recent History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">May 24, 2026</p>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      &quot;Complained of blurred vision... diagnosed with myopia...&quot;
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Workspace Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-emerald-700 shadow-sm font-bold" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card className="min-h-[500px]">
            <CardContent className="pt-8 px-8">
              {activeTab === "notes" && <ConsultationNotes />}
              {activeTab === "exam" && <EyeExamination />}
              {activeTab === "diagnosis" && <DiagnosisPrescription />}
            </CardContent>
          </Card>

          {/* Workspace Footer Actions */}
          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-700">Clear Form</button>
              <div className="w-px h-4 bg-slate-200" />
              <button className="text-xs font-bold text-slate-500 hover:text-slate-700">Save as Draft</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Refer Patient
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                Order Eye Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
