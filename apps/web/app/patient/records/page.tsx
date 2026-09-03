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
  ExternalLink,
} from "lucide-react";
import { usePatientRecords, usePatientProfile, MedicalRecord } from "@/hooks/usePatientPortal";
import { useFormatCurrency } from "@/lib/currency";
import jsPDF from "jspdf";

function getDoctorName(staff?: { firstName: string; lastName: string }): string {
  if (!staff) return "Unknown Doctor";
  return `Dr. ${staff.firstName} ${staff.lastName}`;
}

export default function RecordsPage() {
  const { data: records = [], isLoading } = usePatientRecords();
  const { data: profile } = usePatientProfile();
  const formatCurrency = useFormatCurrency();

  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [isTestDetailModalOpen, setTestDetailModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<MedicalRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showLabReports, setShowLabReports] = useState(false);
  const [showImaging, setShowImaging] = useState(false);

  const sortedRecords = [...records].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  const latestRecord = sortedRecords[0];
  const latestPrescription = latestRecord?.prescriptions?.[0];

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : "Patient";

  const handleDownload = () => {
    if (!latestRecord) return;
    setIsDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(13, 148, 136);
      doc.text("Vemtap Clinic - Medical Record", 20, 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Patient: ${displayName}`, 20, 35);
      doc.text(`Date: ${latestRecord.visitDate}`, 20, 45);
      doc.text(`Doctor: ${getDoctorName(latestRecord.staff)}`, 20, 55);
      if (latestRecord.diagnosis) doc.text(`Diagnosis: ${latestRecord.diagnosis}`, 20, 65);
      if (latestRecord.notes) doc.text(`Notes: ${latestRecord.notes}`, 20, 75);
      doc.line(20, 85, 190, 85);
      doc.text("Records exported from Vemtap Health.", 20, 100);
      doc.save("Medical_Record.pdf");
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1500);
  };

  const handleOpenTest = (record: MedicalRecord) => {
    setSelectedTest(record);
    setTestDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 relative pb-10">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Access your consultation history, prescriptions, and test results.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-80 bg-gray-100 rounded-[2.5rem] animate-pulse" />
            <div className="h-60 bg-gray-100 rounded-[2.5rem] animate-pulse" />
          </div>
          <div className="h-80 bg-gray-100 rounded-[2.5rem] animate-pulse" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">No medical records found</p>
          <p className="text-gray-400 text-sm mt-1">Your consultation history will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Latest Prescription */}
            {latestRecord && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-100 p-3 rounded-2xl">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Latest Record</h2>
                      <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                        Visited {latestRecord.visitDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {latestRecord.diagnosis && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                      <p className="text-sm font-bold text-gray-900">{latestRecord.diagnosis}</p>
                    </div>
                  )}
                  {latestRecord.symptoms && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Symptoms</p>
                      <p className="text-sm font-bold text-gray-900">{latestRecord.symptoms}</p>
                    </div>
                  )}
                  {latestPrescription && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prescription</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-bold text-gray-700">{latestPrescription.medication}</span>
                          <span className="text-sm text-gray-500">{latestPrescription.dosage}</span>
                        </div>
                        <p className="text-xs text-gray-500">{latestPrescription.frequency} &bull; {latestPrescription.duration}</p>
                        {latestPrescription.instructions && (
                          <p className="text-xs text-gray-500 italic">{latestPrescription.instructions}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {latestRecord.vitals && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vitals</p>
                      <div className="grid grid-cols-2 gap-3">
                        {latestRecord.vitals.bloodPressure && (
                          <div className="text-xs"><span className="text-gray-500">BP:</span> <span className="font-bold">{latestRecord.vitals.bloodPressure}</span></div>
                        )}
                        {latestRecord.vitals.heartRate && (
                          <div className="text-xs"><span className="text-gray-500">Heart Rate:</span> <span className="font-bold">{latestRecord.vitals.heartRate} bpm</span></div>
                        )}
                        {latestRecord.vitals.temperature && (
                          <div className="text-xs"><span className="text-gray-500">Temp:</span> <span className="font-bold">{latestRecord.vitals.temperature}°C</span></div>
                        )}
                        {latestRecord.vitals.weight && (
                          <div className="text-xs"><span className="text-gray-500">Weight:</span> <span className="font-bold">{latestRecord.vitals.weight} kg</span></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setPrescriptionModalOpen(true)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-sm shadow-xl shadow-teal-600/20 active:scale-95"
                  >
                    <Eye className="w-5 h-5" /> Full Details
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
            )}

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
                {sortedRecords.map((record) => (
                  <div key={record.id} className="relative pl-8 group">
                    <div className="absolute w-4 h-4 bg-white border-4 border-teal-500 rounded-full -left-[9px] top-1 group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{record.visitDate}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded text-gray-500">{record.recordType}</span>
                    </div>
                    <h3 className="text-gray-900 font-black text-lg mb-1">{record.diagnosis || record.recordType}</h3>
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500">
                      <User className="w-3 h-3" /> {getDoctorName(record.staff)}
                    </div>
                    {(record.symptoms || record.notes) && (
                      <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                        {record.symptoms || record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {sortedRecords.filter((r) => r.vitals).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gray-900 rounded-[2.5rem] p-8 shadow-xl text-white h-fit relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <Activity className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">Vitals</h2>
                      <p className="text-xs text-teal-400 font-bold uppercase tracking-widest">Latest Data</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {sortedRecords
                      .filter((r) => r.vitals)
                      .slice(0, 1)
                      .map((r) => {
                        const v = r.vitals!;
                        return (
                          <div key={r.id} className="space-y-3">
                            {v.bloodPressure && (
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Blood Pressure</p>
                                <p className="text-lg font-black">{v.bloodPressure}</p>
                              </div>
                            )}
                            {v.heartRate && (
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Heart Rate</p>
                                <p className="text-lg font-black">{v.heartRate} bpm</p>
                              </div>
                            )}
                            {v.temperature && (
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Temperature</p>
                                <p className="text-lg font-black">{v.temperature}°C</p>
                              </div>
                            )}
                            {v.weight && (
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Weight</p>
                                <p className="text-lg font-black">{v.weight} kg</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}

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
      )}

      {/* Record Detail Modal */}
      <AnimatePresence>
        {isPrescriptionModalOpen && latestRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
              onClick={() => setPrescriptionModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setPrescriptionModalOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="flex items-center gap-6 mb-10 border-b border-gray-100 pb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-[1.5rem] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Record Detail</h2>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {latestRecord.visitDate}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1 text-teal-600"><User className="w-4 h-4" /> {getDoctorName(latestRecord.staff)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {latestRecord.diagnosis && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diagnosis</p>
                    <p className="text-sm font-bold text-gray-900">{latestRecord.diagnosis}</p>
                  </div>
                )}
                {latestRecord.symptoms && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Symptoms</p>
                    <p className="text-sm font-bold text-gray-900">{latestRecord.symptoms}</p>
                  </div>
                )}
                {latestRecord.notes && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Clinical Notes</p>
                    <p className="text-sm font-bold text-blue-900 leading-relaxed italic">"{latestRecord.notes}"</p>
                  </div>
                )}
                {latestPrescription && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prescription</p>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900">{latestPrescription.medication} - {latestPrescription.dosage}</p>
                      <p className="text-xs text-gray-500">{latestPrescription.frequency} for {latestPrescription.duration}</p>
                      {latestPrescription.instructions && <p className="text-xs text-gray-500 italic">{latestPrescription.instructions}</p>}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleDownload} className="w-full mt-8 bg-gray-900 text-white py-5 rounded-3xl font-black shadow-xl shadow-gray-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
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

              <div className="w-20 h-20 bg-blue-500 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{selectedTest.recordType}</h2>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                <span>{selectedTest.visitDate}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{getDoctorName(selectedTest.staff)}</span>
              </div>

              <div className="space-y-4">
                {selectedTest.diagnosis && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2">Diagnosis</p>
                    <p className="text-lg font-black text-gray-900">{selectedTest.diagnosis}</p>
                  </div>
                )}
                {(selectedTest.symptoms || selectedTest.notes) && (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Clinical Remarks</p>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">
                      {selectedTest.symptoms || selectedTest.notes}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setTestDetailModalOpen(false)}
                className="w-full mt-8 bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-teal-600/20 transition-all active:scale-95"
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
                {sortedRecords.filter((r) => r.recordType === "lab").length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lab reports found</p>
                ) : (
                  sortedRecords.filter((r) => r.recordType === "lab").map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white"><FileText className="w-5 h-5 text-teal-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{r.diagnosis || "Lab Report"}</p>
                          <p className="text-xs text-gray-500">{r.visitDate}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Completed</span>
                    </div>
                  ))
                )}
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
                {sortedRecords.filter((r) => r.recordType === "imaging").length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No imaging scans found</p>
                ) : (
                  sortedRecords.filter((r) => r.recordType === "imaging").map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white"><Eye className="w-5 h-5 text-purple-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{r.diagnosis || "Imaging Scan"}</p>
                          <p className="text-xs text-gray-500">{r.visitDate}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Available</span>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowImaging(false)} className="w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
