"use client";

import React, { useState } from "react";
import {
  Camera, CheckCircle2, ClipboardCheck, FileImage, FileText,
  Loader2, Paperclip, ScanLine, Search, ShieldCheck, Upload,
  ChevronRight, X, Eye, Download, Trash2, Plus, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const mockPatients = [
  { id: "PT-2024-001", name: "Chidimma Okoro", plan: "HMO", provider: "Reliance Health" },
  { id: "PT-2024-002", name: "Babatunde Lawal", plan: "Private", provider: "Self-Pay" },
  { id: "PT-2024-003", name: "Yuki Tanaka", plan: "HMO", provider: "Axa Mansard" },
];

const documentTypes = ["Patient form", "HMO card", "Referral letter", "ID card", "Prescription"];

const initialAttachments = [
  { name: "ID_Card_Front.jpg", type: "ID card", status: "Uploaded", date: "Today, 09:12 AM", size: "2.1 MB" },
  { name: "Reliance_HMO.pdf", type: "HMO card", status: "OCR complete", date: "Today, 08:45 AM", size: "1.4 MB" },
];

const initialFields = [
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
  const [extractedFields, setExtractedFields] = useState(initialFields);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("ID card");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAttachment, setShowAttachment] = useState<typeof initialAttachments[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "attachments">("scan");

  const filteredPatients = mockPatients.filter((patient) =>
    [patient.name, patient.id, patient.provider].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const runMockScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("complete");
      setAttachments((current) => [
        { name: `${documentType.replaceAll(" ", "_")}_scan.jpg`, type: documentType, status: "OCR complete", date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, size: "1.8 MB" },
        ...current,
      ]);
      showToast(`${documentType} scanned & OCR extracted`);
    }, 1400);
  };

  const handleSaveData = () => {
    setShowSaveModal(false);
    showToast("Extracted data saved to patient record");
  };

  const handleUpload = () => {
    setAttachments((current) => [
      { name: `${uploadType.replaceAll(" ", "_")}_upload.pdf`, type: uploadType, status: "Uploaded", date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, size: "0.9 MB" },
      ...current,
    ]);
    setShowUploadModal(false);
    showToast(`${uploadType} uploaded`);
  };

  const removeAttachment = (idx: number) => {
    const removed = attachments[idx];
    setAttachments((current) => current.filter((_, i) => i !== idx));
    showToast(`${removed.name} removed`);
  };

  const stats = [
    { label: "Scans", value: "18", icon: ScanLine, filter: "scan" },
    { label: "OCR Done", value: "14", icon: ClipboardCheck, filter: "scan" },
    { label: "Attachments", value: String(attachments.length), icon: FileImage, filter: "attachments" },
  ];

  return (
    <div className="space-y-5 sm:space-y-8 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Documents</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Scan forms, extract OCR, and attach files to patient records.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map((stat) => (
            <button key={stat.label} onClick={() => setActiveTab(stat.filter as "scan" | "attachments")}
              className={cn("bg-white border rounded-xl sm:rounded-[1.5rem] px-3 sm:px-5 py-3 sm:py-4 shadow-sm text-left transition-all hover:shadow-md", activeTab === stat.filter ? "border-sky-200 bg-sky-50" : "border-slate-100")}>
              <stat.icon size={14} className={cn("mb-1", activeTab === stat.filter ? "text-sky-600" : "text-sky-400")} />
              <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-8">
        {/* Sidebar */}
        <aside className="xl:col-span-1 space-y-4 sm:space-y-6">
          {/* Patient Select */}
          <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-3 sm:mb-4">Attach To Patient</h2>
            <div className="relative mb-3 sm:mb-4">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient..."
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none text-xs font-bold" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {filteredPatients.map((patient) => (
                <button key={patient.id} onClick={() => { setSelectedPatient(patient); showToast(`${patient.name} selected`); }}
                  className={cn("w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl border text-left transition-all", selectedPatient.id === patient.id ? "bg-sky-50 border-sky-100" : "border-slate-100 hover:bg-slate-50")}>
                  <p className="text-xs font-black text-slate-900 truncate">{patient.name}</p>
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 truncate">{patient.id} &bull; {patient.provider}</p>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No patients found</p>
              )}
            </div>
          </section>

          {/* Upload */}
          <section className="bg-slate-900 text-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 shadow-xl shadow-slate-900/20">
            <Paperclip size={24} className="text-sky-400 mb-3 sm:mb-4" />
            <h2 className="text-base sm:text-lg font-black">Upload</h2>
            <p className="text-[10px] sm:text-xs text-white/50 font-medium mt-1 mb-4 sm:mb-5">Add files to patient record.</p>
            <button onClick={() => setShowUploadModal(true)}
              className="w-full py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-white text-slate-900 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-50 flex items-center justify-center gap-2 transition-all">
              <Upload size={14} /> Upload File
            </button>
          </section>
        </aside>

        {/* Main */}
        <main className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
          {/* Scanner */}
          <section id="scanner" className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] shadow-sm overflow-hidden scroll-mt-24">
            <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black text-slate-900">Scan Form</h2>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{selectedPatient.name} &bull; {selectedPatient.id}</p>
              </div>
              <span className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shrink-0", selectedPatient.plan === "HMO" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                {selectedPatient.plan}
              </span>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              {/* Document type chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {documentTypes.map((type) => (
                  <button key={type} onClick={() => { setDocumentType(type); setScanState("idle"); }}
                    className={cn("px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0", documentType === type ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-sky-50")}>
                    {type}
                  </button>
                ))}
              </div>

              {/* Scan area */}
              <div className="relative min-h-[220px] sm:min-h-[360px] rounded-2xl sm:rounded-[3rem] border-2 sm:border-4 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {scanState === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 sm:p-10">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-[2rem] bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400 mb-4 sm:mb-6">
                        <Camera size={28} />
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-slate-900">Ready to scan</h3>
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 sm:mt-2">Place the {documentType.toLowerCase()} on the scanner.</p>
                    </motion.div>
                  )}
                  {scanState === "scanning" && (
                    <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 sm:p-10">
                      <Loader2 size={36} className="animate-spin text-sky-600 mx-auto mb-4 sm:mb-6" />
                      <h3 className="text-lg sm:text-2xl font-black text-slate-900">Scanning & OCR</h3>
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 sm:mt-2">Extracting text from {documentType.toLowerCase()}...</p>
                    </motion.div>
                  )}
                  {scanState === "complete" && (
                    <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center p-6 sm:p-10">
                      <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-4 sm:mb-6" />
                      <h3 className="text-lg sm:text-2xl font-black text-slate-900">OCR Complete</h3>
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 sm:mt-2">Review extracted fields below before saving.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={runMockScan} disabled={scanState === "scanning"}
                  className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  {scanState === "scanning" ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
                  {scanState === "scanning" ? "Scanning..." : "Start Scan"}
                </button>
                <button onClick={() => setScanState("idle")}
                  className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Right panel */}
          <aside className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* OCR Extraction */}
            <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">OCR Extraction</h2>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">Editable fields</p>
                </div>
              </div>
              {scanState === "idle" ? (
                <div className="p-6 sm:p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl sm:rounded-2xl">
                  <ScanLine size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No scan data yet</p>
                  <p className="text-[9px] font-medium mt-1">Start a scan above to extract fields</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {extractedFields.map((field, i) => (
                    <div key={field.label} className="p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                        <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                        <span className="text-[8px] sm:text-[9px] font-black text-emerald-600">{field.confidence}</span>
                      </div>
                      <input defaultValue={field.value} onChange={(e) => { const f = [...extractedFields]; f[i] = { ...f[i], value: e.target.value }; setExtractedFields(f); }}
                        className="w-full bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
              {scanState === "complete" && (
                <button onClick={() => setShowSaveModal(true)}
                  className="mt-4 sm:mt-5 w-full py-3 sm:py-4 rounded-lg sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all">
                  <ShieldCheck size={14} /> Save Extracted Data
                </button>
              )}
            </section>

            {/* Attachments */}
            <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <FileImage size={20} className="text-slate-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">Attachments</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest ml-auto">{attachments.length}</span>
              </div>
              {attachments.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl sm:rounded-2xl">
                  <Paperclip size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No attachments</p>
                  <p className="text-[9px] font-medium mt-1">Upload or scan a document to attach</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {attachments.map((attachment, index) => (
                    <div key={`${attachment.name}-${index}`}
                      className="p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center justify-between gap-2">
                        <button onClick={() => setShowAttachment(attachment)} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{attachment.name}</p>
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{attachment.type} &bull; {attachment.size}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest", attachment.status === "OCR complete" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700")}>{attachment.status}</span>
                          <button onClick={() => removeAttachment(index)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowUploadModal(true)}
                className="mt-3 sm:mt-4 w-full py-2.5 sm:py-3 rounded-lg sm:rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-sky-200 hover:text-sky-600 transition-all flex items-center justify-center gap-2">
                <Plus size={12} /> Add Attachment
              </button>
            </section>
          </aside>
        </main>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload File">
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Type</label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900 text-sm">
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 text-center">
            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600">Drag & drop or click to browse</p>
            <p className="text-[9px] text-slate-400 mt-1">PDF, JPG, PNG — up to 10 MB</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleUpload}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
              <Upload size={14} /> Upload {uploadType}
            </button>
            <button onClick={() => setShowUploadModal(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Save Confirmation Modal */}
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} title="Save Extracted Data">
        <div className="space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><ShieldCheck size={24} /></div>
            <div className="min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedPatient.name}</h4>
              <p className="text-xs text-slate-500">{documentType} &bull; {selectedPatient.id}</p>
            </div>
          </div>
          <div className="space-y-2">
            {extractedFields.map((f) => (
              <div key={f.label} className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">{f.label}</span>
                <span className="text-[10px] sm:text-xs font-black text-slate-900 truncate ml-2">{f.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleSaveData}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Confirm & Save
            </button>
            <button onClick={() => setShowSaveModal(false)}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Attachment Detail Modal */}
      <Modal isOpen={!!showAttachment} onClose={() => setShowAttachment(null)} title="File Details">
        {showAttachment && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0"><FileText size={24} /></div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{showAttachment.name}</h4>
                <p className="text-xs text-slate-500">{showAttachment.date}</p>
              </div>
              <span className={cn("px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0", showAttachment.status === "OCR complete" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700")}>{showAttachment.status}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Type</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{showAttachment.type}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Size</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{showAttachment.size}</span>
              </div>
              <div className="flex justify-between p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">Patient</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{selectedPatient.name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowAttachment(null); showToast(`Downloading ${showAttachment.name}`); }}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-sky-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
                <Download size={14} /> Download
              </button>
              <button onClick={() => setShowAttachment(null)}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
