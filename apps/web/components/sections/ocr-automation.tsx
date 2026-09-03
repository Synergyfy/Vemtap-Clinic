"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scan, FileSearch, Check, Database, Zap, Sparkles } from "lucide-react";

export const OCRAutomation = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            {/* OCR Animation Mockup */}
            <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden relative group">
              <div className="bg-slate-800 p-8 rounded-[2.4rem]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
                      <Scan className="text-brand-blue" size={20} />
                    </div>
                    <div className="text-white font-bold">AI Document Scanner</div>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">98% Accuracy</div>
                </div>

                <div className="relative mb-8 aspect-[4/3] bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden">
                  {/* "Paper" Document */}
                  <div className="absolute inset-4 bg-white p-6 rounded-lg text-[8px] text-slate-400 space-y-4">
                    <div className="w-1/2 h-4 bg-slate-100 mb-6"></div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-50"></div>
                      <div className="w-full h-2 bg-slate-50"></div>
                      <div className="w-3/4 h-2 bg-slate-50"></div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <div className="w-1/3 h-6 bg-slate-100 rounded"></div>
                        <div className="w-1/4 h-6 bg-brand-blue/10 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Scanning Line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-brand-blue shadow-[0_0_15px_rgba(2,132,199,0.8)] z-10"
                  />

                  {/* Recognition Boxes */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
                    className="absolute top-1/4 left-1/4 w-32 h-6 border-2 border-emerald-400 rounded z-20"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.9, 1] }}
                    className="absolute top-2/3 left-1/2 w-24 h-6 border-2 border-emerald-400 rounded z-20"
                  />
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Patient Name", value: "Sarah Johnson", status: "detected" },
                    { label: "Provider", value: "Reliance Health", status: "detected" },
                    { label: "Policy ID", value: "RH-9920-881", status: "extracted" },
                  ].map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{field.label}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white font-medium">{field.value}</span>
                        <Check size={12} className="text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating Sparkles */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center blur-sm">
              <Sparkles className="text-brand-blue" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
              AI & Automation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6 leading-tight">
              Reduce <span className="text-brand-blue">Manual</span> Data Entry
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Scan forms, prescriptions, and HMO cards. Our intelligent OCR engine extracts patient information automatically, reducing errors and saving staff hours every day.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: Zap, title: "Lightning Fast Extraction", desc: "Extract data from any healthcare document in under 2 seconds." },
                { icon: Database, title: "Auto-filled Patient Records", desc: "Extracted data flows directly into your electronic health records." },
                { icon: FileSearch, title: "HMO Card Recognition", desc: "Support for all major health insurance providers with auto-verification." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 bg-white shadow-md border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                    <item.icon className="text-brand-blue" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-navy mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
