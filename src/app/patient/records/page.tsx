"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Eye, 
  Download, 
  ChevronRight, 
  Activity, 
  X, 
  FileCheck2, 
  Loader2,
  Stethoscope,
  Info,
  Calendar,
  User,
  ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";

export default function RecordsPage() {
  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [isTestDetailModalOpen, setTestDetailModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showLabReports, setShowLabReports] = useState(false);
  const [showImaging, setShowImaging] = useState(false);

  const testResults = [
    { 
      id: "VA-101",
      type: "Visual Acuity", 
      date: "Sep 10, 2026",
      od: "20/20", 
      os: "20/20",
      notes: "Excellent distance vision. Patient corrected with lenses.",
      doctor: "Optom. S. Danladi",
      color: "bg-blue-500"
    },
    { 
      id: "IOP-102",
      type: "IOP (Intraocular Pressure)", 
      date: "Sep 10, 2026",
      od: "14 mmHg", 
      os: "15 mmHg",
      notes: "Pressure is within normal physiological limits. No glaucoma risk detected.",
      doctor: "Dr. Sarah Jenkins",
      color: "bg-emerald-500"
    },
    { 
      id: "FUN-103",
      type: "Fundus Imaging", 
      date: "Sep 10, 2026",
      summary: "Normal healthy retina.",
      notes: "Retinal vasculature is normal. Optic disc margin is sharp. Macula is healthy.",
      doctor: "Dr. Sarah Jenkins",
      color: "bg-purple-500"
    }
  ];

  const handleOpenTest = (test: any) => {
    setSelectedTest(test);
    setTestDetailModalOpen(true);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136);
      doc.text("Vemtap Clinic - Medical Record", 20, 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Patient: Alex Carter", 20, 35);
      doc.text("Patient ID: VC-2024-91", 20, 45);
      doc.text("Date: Sep 10, 2026", 20, 55);
      doc.text("Doctor: Dr. Sarah Jenkins", 20, 65);
      doc.line(20, 75, 190, 75);
      doc.setFontSize(16);
      doc.text("Prescription Details", 20, 90);
      doc.setFontSize(12);
      doc.text("Right Eye (OD): SPH -1.50 | CYL -0.50 | AXIS 180 | ADD +1.00", 20, 105);
      doc.text("Left Eye (OS):  SPH -1.25 | CYL ---   | AXIS --- | ADD +1.00", 20, 115);
      doc.line(20, 130, 190, 130);
      doc.text("Doctor's Notes:", 20, 145);
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Please ensure anti-reflective coating is added to the lenses", 20, 155);
      doc.text("for computer use.", 20, 162);
      doc.save("Medical_Prescription.pdf");

      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 relative pb-10">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Medical Records
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Access your consultation history, prescriptions, and test results.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Prescription */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-teal-100 p-3 rounded-2xl">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Prescription</h2>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Issued Sep 10, 2026</p>
                </div>
              </div>
              <div className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                Latest
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-100">
              <div className="grid grid-cols-5 text-[10px] font-black text-gray-400 mb-4 px-4 uppercase tracking-widest">
                <div className="col-span-1">Eye</div>
                <div className="col-span-1 text-center">SPH</div>
                <div className="col-span-1 text-center">CYL</div>
                <div className="col-span-1 text-center">AXIS</div>
                <div className="col-span-1 text-center">ADD</div>
              </div>
              <div className="grid grid-cols-5 text-sm font-bold bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-100">
                <div className="col-span-1 text-teal-700">OD</div>
                <div className="col-span-1 text-center text-gray-900">-1.50</div>
                <div className="col-span-1 text-center text-gray-900">-0.50</div>
                <div className="col-span-1 text-center text-gray-900">180</div>
                <div className="col-span-1 text-center text-gray-900">+1.00</div>
              </div>
              <div className="grid grid-cols-5 text-sm font-bold bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="col-span-1 text-teal-700">OS</div>
                <div className="col-span-1 text-center text-gray-900">-1.25</div>
                <div className="col-span-1 text-center text-gray-400">---</div>
                <div className="col-span-1 text-center text-gray-400">---</div>
                <div className="col-span-1 text-center text-gray-900">+1.00</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setPrescriptionModalOpen(true)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-sm shadow-xl shadow-teal-600/20 active:scale-95"
              >
                <Eye className="w-5 h-5" /> Full Examination Details
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-sm border border-gray-200 active:scale-95"
              >
                {isDownloading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : downloadSuccess ? (
                  <><FileCheck2 className="w-5 h-5 text-green-600" /> PDF Ready!</>
                ) : (
                  <><Download className="w-5 h-5" /> Download Record</>
                )}
              </button>
            </div>
          </motion.div>

          {/* Consultation History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Timeline</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Consultation History</p>
              </div>
            </div>
            
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-12">
              {[
                { date: "Sep 10, 2026", title: "Comprehensive Eye Exam", doctor: "Dr. Sarah Jenkins", desc: "Routine checkup. Mild astigmatism detected in right eye. New prescription issued for computer use.", tag: "Routine" },
                { date: "Mar 15, 2025", title: "Red Eye Consultation", doctor: "Dr. Michael Chen", desc: "Diagnosed with mild conjunctivitis. Prescribed antibiotic drops for 7 days. Resolved upon follow-up.", tag: "Urgent" }
              ].map((record, i) => (
                <div key={i} className="relative pl-8 group">
                  <div className="absolute w-4 h-4 bg-white border-4 border-teal-500 rounded-full -left-[9px] top-1 group-hover:scale-125 transition-transform"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{record.date}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded text-gray-500">{record.tag}</span>
                  </div>
                  <h3 className="text-gray-900 font-black text-lg mb-1">{record.title}</h3>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500">
                    <User className="w-3 h-3" /> {record.doctor}
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed font-medium">{record.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Test Results Overview */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-900 rounded-[2.5rem] p-8 shadow-xl text-white h-fit relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Test Results</h2>
                  <p className="text-xs text-teal-400 font-bold uppercase tracking-widest">Latest Diagnostic Data</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div 
                    key={test.id}
                    onClick={() => handleOpenTest(test)}
                    className="bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${test.color}`} />
                        <span className="font-black text-sm tracking-tight">{test.type}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    {test.od ? (
                      <div className="flex gap-6 text-[11px] font-black text-white/60 tracking-widest uppercase">
                        <span>OD: <span className="text-white">{test.od}</span></span>
                        <span>OS: <span className="text-white">{test.os}</span></span>
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold text-teal-400 tracking-wide line-clamp-1">{test.summary}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex gap-3">
                <Info className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <p className="text-[10px] text-teal-100 font-medium leading-relaxed">
                  Click on any diagnostic result to view detailed clinical findings and doctor's remarks.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button onClick={() => setShowLabReports(true)} className="w-full flex justify-between items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-bold text-gray-700">Lab Reports</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
              </button>
              <button onClick={() => setShowImaging(true)} className="w-full flex justify-between items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-bold text-gray-700">Imaging Scans</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Detail Modal */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
              onClick={() => setPrescriptionModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setPrescriptionModalOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="flex items-center gap-6 mb-10 border-b border-gray-100 pb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-[1.5rem] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Prescription Detail</h2>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Sep 10, 2026</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1 text-teal-600"><User className="w-4 h-4" /> Dr. Sarah Jenkins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Distance Refraction</h3>
                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-teal-700 uppercase">Right (OD)</span>
                        <span className="font-bold text-gray-900">-1.50 / -0.50 x 180</span>
                      </div>
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-teal-700 uppercase">Left (OS)</span>
                        <span className="font-bold text-gray-900">-1.25 / SPH</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Near Addition</h3>
                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-teal-700 uppercase">Right (OD)</span>
                        <span className="font-bold text-gray-900">+1.00</span>
                      </div>
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-teal-700 uppercase">Left (OS)</span>
                        <span className="font-bold text-gray-900">+1.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                  <div className="bg-blue-100 p-2 rounded-xl h-fit">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Clinical Note</p>
                    <p className="text-sm font-bold text-blue-900 leading-relaxed italic">
                      "Patient reports digital eye strain. Prescribed anti-reflective coating for enhanced computer use. Review in 12 months for routine follow-up."
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleDownload}
                className="w-full mt-10 bg-gray-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-gray-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" /> Download Digital Copy
              </button>
            </motion.div>
          </div>
        )}

        {/* Test Detail Modal */}
        {isTestDetailModalOpen && selectedTest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
              onClick={() => setTestDetailModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setTestDetailModalOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className={`w-20 h-20 ${selectedTest.color} rounded-[1.75rem] flex items-center justify-center mb-8 shadow-lg shadow-current/20`}>
                <Activity className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{selectedTest.type}</h2>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                <span>{selectedTest.date}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{selectedTest.doctor}</span>
              </div>

              <div className="space-y-6">
                {selectedTest.od ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2">Right (OD)</p>
                      <p className="text-2xl font-black text-gray-900">{selectedTest.od}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2">Left (OS)</p>
                      <p className="text-2xl font-black text-gray-900">{selectedTest.os}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2">Observation</p>
                    <p className="text-lg font-black text-gray-900">{selectedTest.summary}</p>
                  </div>
                )}

                <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Clinical Remarks</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">
                    {selectedTest.notes}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setTestDetailModalOpen(false)}
                className="w-full mt-10 bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-teal-600/20 transition-all active:scale-95"
              >
                Close Findings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lab Reports Modal */}
      <AnimatePresence>
        {showLabReports && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowLabReports(false)} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowLabReports(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Lab Reports</h2>
              <div className="space-y-3">
                {[
                  { name: "Blood Chemistry Panel", date: "Sep 10, 2026", status: "Completed", icon: FileText },
                  { name: "Lipid Profile", date: "Sep 10, 2026", status: "Completed", icon: FileText },
                  { name: "HbA1c (Diabetes Screening)", date: "Mar 15, 2025", status: "Completed", icon: FileText },
                ].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white"><report.icon className="w-5 h-5 text-teal-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-widest">{report.status}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowLabReports(false)} className="w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Imaging Scans Modal */}
      <AnimatePresence>
        {showImaging && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowImaging(false)} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowImaging(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Imaging Scans</h2>
              <div className="space-y-3">
                {[
                  { name: "Fundus Photography", date: "Sep 10, 2026", status: "Available", icon: Eye },
                  { name: "OCT Retinal Scan", date: "Mar 15, 2025", status: "Available", icon: Eye },
                  { name: "Visual Field Test", date: "Mar 15, 2025", status: "Archived", icon: Eye },
                ].map((scan, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white"><scan.icon className="w-5 h-5 text-purple-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{scan.name}</p>
                        <p className="text-xs text-gray-500">{scan.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${scan.status === 'Available' ? 'text-teal-700 bg-teal-100' : 'text-gray-500 bg-gray-200'}`}>{scan.status}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowImaging(false)} className="w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
