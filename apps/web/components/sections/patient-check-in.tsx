"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, QrCode, ClipboardCheck, Users, ArrowRight } from "lucide-react";

export const PatientCheckIn = () => {
  const steps = [
    { icon: Smartphone, title: "Patient Arrives", desc: "Patient scans clinic QR code" },
    { icon: QrCode, title: "Digital Form", desc: "Select visit purpose & fill info" },
    { icon: ClipboardCheck, title: "Queue Assignment", desc: "Auto-assigned to doctor queue" },
    { icon: Users, title: "Doctor Queue", desc: "Real-time updates on status" },
  ];

  return (
    <section id="features" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6 leading-tight">
              Patients <span className="text-brand-blue">Check In</span> Themselves
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Patients scan clinic QR codes, choose visit purpose, select HMO/private, fill forms, and automatically enter the queue system. No more paper forms or manual entry.
            </p>

            <div className="space-y-8 relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100 hidden md:block" />
              
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-6 relative z-10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-50 flex items-center justify-center shrink-0">
                    <step.icon className="text-brand-blue" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-brand-navy mb-1">{step.title}</h4>
                    <p className="text-slate-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Phone Mockup */}
            <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
              
              <div className="absolute inset-0 bg-white p-6 pt-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-brand-navy font-bold">Vemtap Check-in</div>
                  <div className="text-[10px] text-slate-400 font-medium">Step 1 of 3</div>
                </div>
                
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-brand-soft-blue rounded-3xl mx-auto flex items-center justify-center mb-4">
                    <QrCode className="text-brand-blue" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">Welcome to VisionCare</h3>
                  <p className="text-xs text-slate-500">Please scan the QR code at the desk or select visit type below.</p>
                </div>

                <div className="space-y-3">
                  {["Eye Examination", "Contact Lens Consultation", "Optical Pickup"].map((type) => (
                    <div key={type} className="p-4 border border-slate-100 rounded-2xl hover:border-brand-blue hover:bg-brand-soft-blue/30 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-brand-navy">{type}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-blue" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-10 left-6 right-6">
                  <div className="p-4 bg-brand-blue text-white rounded-2xl text-center text-sm font-bold shadow-lg shadow-brand-blue/30">
                    Confirm Visit Type
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 glass p-4 rounded-2xl shadow-2xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-soft-blue rounded-full flex items-center justify-center">
                  <Users className="text-brand-blue" size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Queue Update</div>
                  <div className="text-xs font-bold text-brand-navy">You are #3 in line</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
