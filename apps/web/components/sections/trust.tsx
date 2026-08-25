"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Reduced Waiting Time", value: "45%" },
  { label: "Faster Patient Intake", value: "3x" },
  { label: "HMO Tracking Accuracy", value: "99.9%" },
  { label: "Clinics Worldwide", value: "500+" },
];

export const TrustSection = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-4">Trusted by Industry Leaders</p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">Empowering Eye Clinics with Intelligence</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logo Placeholders */}
            {["VisionCare", "OptiCenter", "EyeTech", "ClearView", "HMO Connect"].map((logo) => (
              <span key={logo} className="text-xl font-black text-slate-400">{logo}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-brand-blue mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
