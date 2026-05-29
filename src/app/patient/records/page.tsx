"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, Download, ChevronRight, Activity, X, FileCheck2, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export default function RecordsPage() {
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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
      
      doc.setFontSize(12);
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
    <div className="space-y-6 relative">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Medical Records
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Access your consultation history, prescriptions, and test results.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Prescription */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" /> Latest Prescription
              </h2>
              <span className="text-sm text-gray-500">Sep 10, 2026</span>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-5 text-sm font-semibold text-gray-500 mb-2 px-2">
                <div className="col-span-1">Eye</div>
                <div className="col-span-1 text-center">SPH</div>
                <div className="col-span-1 text-center">CYL</div>
                <div className="col-span-1 text-center">AXIS</div>
                <div className="col-span-1 text-center">ADD</div>
              </div>
              <div className="grid grid-cols-5 text-sm font-medium bg-white p-3 rounded-xl shadow-sm mb-2">
                <div className="col-span-1 font-bold text-teal-700">Right (OD)</div>
                <div className="col-span-1 text-center">-1.50</div>
                <div className="col-span-1 text-center">-0.50</div>
                <div className="col-span-1 text-center">180</div>
                <div className="col-span-1 text-center">+1.00</div>
              </div>
              <div className="grid grid-cols-5 text-sm font-medium bg-white p-3 rounded-xl shadow-sm">
                <div className="col-span-1 font-bold text-teal-700">Left (OS)</div>
                <div className="col-span-1 text-center">-1.25</div>
                <div className="col-span-1 text-center">SPH</div>
                <div className="col-span-1 text-center">---</div>
                <div className="col-span-1 text-center">+1.00</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setDetailsOpen(true)}
                className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" /> View Details
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm border border-gray-200"
              >
                {isDownloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...</>
                ) : downloadSuccess ? (
                  <><FileCheck2 className="w-4 h-4 text-green-600" /> Downloaded!</>
                ) : (
                  <><Download className="w-4 h-4" /> Download PDF</>
                )}
              </button>
            </div>
          </motion.div>

          {/* Consultation History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-teal-600" /> Consultation Timeline
            </h2>
            
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {[
                { date: "Sep 10, 2026", title: "Comprehensive Eye Exam", doctor: "Dr. Sarah Jenkins", desc: "Routine checkup. Mild astigmatism detected in right eye. New prescription issued." },
                { date: "Mar 15, 2025", title: "Red Eye Consultation", doctor: "Dr. Michael Chen", desc: "Diagnosed with mild conjunctivitis. Prescribed antibiotic drops for 7 days." }
              ].map((record, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                  <div className="mb-1 text-sm font-semibold text-teal-600">{record.date}</div>
                  <h3 className="text-gray-900 font-bold mb-1">{record.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{record.doctor}</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{record.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Test Results Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-teal-900 rounded-3xl p-6 shadow-sm text-white h-fit"
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-teal-300" /> Test Results
          </h2>
          
          <div className="space-y-4">
            <div className="bg-teal-800/50 p-4 rounded-2xl backdrop-blur-sm hover:bg-teal-800 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Visual Acuity</span>
                <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex gap-4 text-sm text-teal-200">
                <span>OD: 20/20</span>
                <span>OS: 20/20</span>
              </div>
            </div>
            
            <div className="bg-teal-800/50 p-4 rounded-2xl backdrop-blur-sm hover:bg-teal-800 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">IOP (Pressure)</span>
                <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex gap-4 text-sm text-teal-200">
                <span>OD: 14 mmHg</span>
                <span>OS: 15 mmHg</span>
              </div>
            </div>
            
            <div className="bg-teal-800/50 p-4 rounded-2xl backdrop-blur-sm hover:bg-teal-800 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Fundus Imaging</span>
                <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-teal-200">Normal healthy retina.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setDetailsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
                  <p className="text-sm text-gray-500">Issued by Dr. Sarah Jenkins on Sep 10, 2026</p>
                </div>
                <button onClick={() => setDetailsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Distance Vision</h3>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="grid grid-cols-5 text-sm font-semibold text-gray-500 mb-2 px-2">
                      <div className="col-span-1">Eye</div>
                      <div className="col-span-1 text-center">SPH</div>
                      <div className="col-span-1 text-center">CYL</div>
                      <div className="col-span-1 text-center">AXIS</div>
                      <div className="col-span-1 text-center">VA</div>
                    </div>
                    <div className="grid grid-cols-5 text-sm font-medium bg-white p-3 rounded-xl shadow-sm mb-2">
                      <div className="col-span-1 font-bold text-teal-700">OD</div>
                      <div className="col-span-1 text-center">-1.50</div>
                      <div className="col-span-1 text-center">-0.50</div>
                      <div className="col-span-1 text-center">180</div>
                      <div className="col-span-1 text-center">20/20</div>
                    </div>
                    <div className="grid grid-cols-5 text-sm font-medium bg-white p-3 rounded-xl shadow-sm">
                      <div className="col-span-1 font-bold text-teal-700">OS</div>
                      <div className="col-span-1 text-center">-1.25</div>
                      <div className="col-span-1 text-center">SPH</div>
                      <div className="col-span-1 text-center">---</div>
                      <div className="col-span-1 text-center">20/20</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Reading Addition</h3>
                  <div className="bg-gray-50 rounded-2xl p-4 flex gap-4">
                    <div className="flex-1 bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                      <span className="font-bold text-teal-700">OD</span>
                      <span className="font-medium">+1.00</span>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                      <span className="font-bold text-teal-700">OS</span>
                      <span className="font-medium">+1.00</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                  <strong>Doctor's Notes:</strong> Please ensure anti-reflective coating is added to the lenses for computer use.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
