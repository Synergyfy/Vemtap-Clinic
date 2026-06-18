"use client";

import React, { useState } from "react";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  ScanLine,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const mockPatients = [
  { id: "PT-2024-001", name: "Chidimma Okoro", plan: "HMO", provider: "Reliance Health" },
  { id: "PT-2024-002", name: "Babatunde Lawal", plan: "Private", provider: "Self-Pay" },
  { id: "PT-2024-003", name: "Yuki Tanaka", plan: "HMO", provider: "Axa Mansard" },
];

const documentTypes = ["Patient form", "HMO card", "Referral letter", "ID card", "Prescription"];

const initialAttachments = [
  { name: "ID_Card_Front.jpg", type: "ID card", status: "Uploaded" },
  { name: "Reliance_HMO.pdf", type: "HMO card", status: "OCR complete" },
];

const extractedFields = [
  { label: "Patient name", value: "Chidimma Okoro", confidence: "98%" },
  { label: "HMO provider", value: "Reliance Health", confidence: "94%" },
  { label: "Policy number", value: "REL-0092-4418", confidence: "91%" },
  { label: "Phone number", value: "+234 802 345 6789", confidence: "96%" },
];

export default function DocumentsPage() {
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [attachments, setAttachments] = useState(initialAttachments);
  const [query, setQuery] = useState("");

  const filteredPatients = mockPatients.filter((patient) =>
    [patient.name, patient.id, patient.provider].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const runMockScan = () => {
    setScanState("scanning");
    window.setTimeout(() => {
      setScanState("complete");
      setAttachments((current) => [
        { name: `${documentType.replaceAll(" ", "_")}_scan.jpg`, type: documentType, status: "OCR complete" },
        ...current,
      ]);
    }, 1400);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Document Scanning</h1>
          <p className="text-slate-500 font-medium">Scan forms, extract OCR data, and attach files to patient records.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Scans", value: "18", icon: ScanLine },
            { label: "OCR Done", value: "14", icon: ClipboardCheck },
            { label: "Pending", value: "4", icon: Loader2 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-[1.5rem] px-5 py-4 shadow-sm">
              <stat.icon size={18} className="text-sky-600 mb-2" />
              <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <aside className="xl:col-span-1 space-y-6">
          <section className="bg-white border border-slate-100 rounded-[3rem] p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-4">Attach To Patient</h2>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold" />
            </div>
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button key={patient.id} onClick={() => setSelectedPatient(patient)} className={cn("w-full p-4 rounded-2xl border text-left transition-all", selectedPatient.id === patient.id ? "bg-sky-50 border-sky-100" : "border-slate-100 hover:bg-slate-50")}>
                  <p className="text-xs font-black text-slate-900">{patient.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{patient.id} • {patient.provider}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-[3rem] p-6 shadow-xl shadow-slate-900/20">
            <Paperclip size={32} className="text-sky-400 mb-4" />
            <h2 className="text-lg font-black">Upload Attachment</h2>
            <p className="text-xs text-white/50 font-medium mt-1 mb-5">Mock file intake for forms, IDs, and HMO cards.</p>
            <button
              onClick={() => setAttachments((current) => [{ name: "Manual_Upload.pdf", type: documentType, status: "Uploaded" }, ...current])}
              className="w-full py-4 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-sky-50 flex items-center justify-center gap-2"
            >
              <Upload size={16} /> Add Mock Upload
            </button>
          </section>
        </aside>

        <main className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <section id="scanner" className="lg:col-span-3 bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden scroll-mt-24">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Scan Form</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedPatient.name} • {selectedPatient.id}</p>
              </div>
              <span className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest", selectedPatient.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                {selectedPatient.plan}
              </span>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {documentTypes.map((type) => (
                  <button key={type} onClick={() => setDocumentType(type)} className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all", documentType === type ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-sky-50")}>
                    {type}
                  </button>
                ))}
              </div>

              <div className="relative min-h-[360px] rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {scanState === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400 mb-6">
                        <Camera size={42} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Ready to scan</h3>
                      <p className="text-sm font-medium text-slate-400 mt-2">Place the {documentType.toLowerCase()} on the scanner or upload a photo.</p>
                    </motion.div>
                  )}
                  {scanState === "scanning" && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-10">
                      <Loader2 size={56} className="animate-spin text-sky-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-slate-900">Scanning and extracting OCR</h3>
                      <p className="text-sm font-medium text-slate-400 mt-2">Mocking document capture and text recognition.</p>
                    </motion.div>
                  )}
                  {scanState === "complete" && (
                    <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center p-10">
                      <CheckCircle2 size={60} className="text-emerald-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-slate-900">OCR extraction complete</h3>
                      <p className="text-sm font-medium text-slate-400 mt-2">Review extracted fields before saving to the patient record.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={runMockScan} className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2">
                  <ScanLine size={16} /> Start Mock Scan
                </button>
                <button onClick={() => setScanState("idle")} className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                  Reset Scanner
                </button>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">OCR Extraction</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Editable mock fields</p>
                </div>
              </div>
              <div className="space-y-3">
                {extractedFields.map((field) => (
                  <div key={field.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                      <span className="text-[9px] font-black text-emerald-600">{field.confidence}</span>
                    </div>
                    <input defaultValue={field.value} className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none" />
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Save Extracted Data
              </button>
            </section>

            <section className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileImage size={24} className="text-slate-400" />
                <h2 className="text-lg font-black text-slate-900">Attachments</h2>
              </div>
              <div className="space-y-3">
                {attachments.map((attachment, index) => (
                  <div key={`${attachment.name}-${index}`} className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{attachment.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{attachment.type}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest">{attachment.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
