"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, QrCode, ClipboardList, TrendingUp } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    { icon: UserPlus, title: "Register Clinic", desc: "Set up your branches, staff, and HMO providers." },
    { icon: QrCode, title: "Generate QR Codes", desc: "Place QR codes at your reception for patient check-in." },
    { icon: ClipboardList, title: "Patients Self Check-In", desc: "Patients scan, fill forms, and enter the queue." },
    { icon: TrendingUp, title: "Manage Operations", desc: "Track patient flow, HMOs, and optical orders." },
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Simple to Set Up, <span className="text-brand-blue">Powerful</span> to Use</h2>
          <p className="text-xl text-slate-500">Get your clinic running on Vemtap in 4 easy steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-blue/10 -translate-y-1/2 hidden md:block"></div>
          
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-[2rem] border-4 border-slate-50 shadow-xl mx-auto flex items-center justify-center mb-6 group hover:border-brand-blue/20 transition-all">
                <step.icon className="text-brand-blue" size={32} />
              </div>
              <h4 className="text-xl font-bold text-brand-navy mb-3">{step.title}</h4>
              <p className="text-sm text-slate-500 px-4">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
