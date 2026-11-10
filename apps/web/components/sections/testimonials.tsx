"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export const Testimonials = () => {
  const highlights = [
    {
      title: "Patient intake",
      text: "Reduce manual registration bottlenecks and keep the front desk moving without delays.",
      icon: "PI",
    },
    {
      title: "Clinical operations",
      text: "Coordinate doctor, nurse, and pharmacy workflows in one connected routine.",
      icon: "CO",
    },
    {
      title: "Financial visibility",
      text: "Track claims, billing, and payments without relying on scattered spreadsheets.",
      icon: "FV",
    },
  ];

  return (
    <section className="py-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Built for <span className="text-brand-blue">Modern Eye Care</span> Teams</h2>
          <p className="text-xl text-slate-500">A single operational layer for intake, clinical care, optical workflows, and billing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative"
            >
              <Quote className="absolute top-8 right-10 text-brand-blue/10 w-16 h-16" />

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-brand-blue text-brand-blue" />)}
              </div>

              <p className="text-slate-600 italic mb-8 leading-relaxed relative z-10">&quot;{item.text}&quot;</p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-soft-blue rounded-2xl flex items-center justify-center text-brand-blue font-bold">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-brand-navy">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational focus</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
