"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  QrCode, ShieldCheck, Activity, Users, Calendar, Scan, 
  LayoutDashboard, Bell, BarChart, Smartphone, Package, CreditCard 
} from "lucide-react";

export const FeaturesGrid = () => {
  const features = [
    { icon: QrCode, title: "QR Self Check-In", desc: "Reduce front desk workload with automated patient arrivals." },
    { icon: ShieldCheck, title: "HMO Management", desc: "End-to-end tracking for claims and insurance revenue." },
    { icon: Package, title: "Optical Workflow", desc: "Track lens orders and production from start to finish." },
    { icon: Activity, title: "Queue Automation", desc: "Smart live waiting room displays and ticket management." },
    { icon: Calendar, title: "Smart Scheduling", desc: "Seamless appointment booking and doctor availability sync." },
    { icon: Scan, title: "OCR Scanning", desc: "Auto-extract data from prescriptions and HMO cards." },
    { icon: LayoutDashboard, title: "Multi-Branch Support", desc: "Monitor all clinic locations from a single platform." },
    { icon: Bell, title: "WhatsApp Alerts", desc: "Automated notifications for appointments and pickups." },
    { icon: BarChart, title: "Deep Analytics", desc: "Real-time revenue, patient, and operational reports." },
    { icon: Smartphone, title: "Patient Portal", desc: "Allow patients to view history and book online." },
    { icon: Activity, title: "Lens Tracking", desc: "Real-time status updates for lab production." },
    { icon: CreditCard, title: "Billing & Payments", desc: "Integrated invoicing for private and HMO patients." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Everything You Need to <span className="text-brand-blue">Scale</span> Your Clinic</h2>
          <p className="text-xl text-slate-500">Powerful features designed specifically for modern ophthalmology and optometry centers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, borderColor: "rgba(2,132,199,0.3)" }}
              className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <feature.icon size={24} />
              </div>
              <h4 className="text-lg font-bold text-brand-navy mb-3">{feature.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
