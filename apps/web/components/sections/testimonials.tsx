"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Adebayo Chen",
      role: "Clinic Owner",
      clinic: "Lagos Vision Center",
      text: "Vemtap has completely transformed how we handle patient check-ins. Our front desk is much calmer, and patients love the QR system.",
      image: "AC",
    },
    {
      name: "Sarah Williams",
      role: "Optical Manager",
      clinic: "OptiCenter Abuja",
      text: "The lens tracking feature is a game-changer. We can finally see where every order is in the production pipeline without calling the lab.",
      image: "SW",
    },
    {
      name: "Dr. Robert Fox",
      role: "Ophthalmologist",
      clinic: "ClearView PH",
      text: "Managing HMO claims used to be a full-time job for two people. With Vemtap, it's automated and much more accurate.",
      image: "RF",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Trusted by <span className="text-brand-blue">Vision Care</span> Experts</h2>
          <p className="text-xl text-slate-500">See how eye clinics are improving their operations with Vemtap.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
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
              
              <p className="text-slate-600 italic mb-8 leading-relaxed relative z-10">"{item.text}"</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-soft-blue rounded-2xl flex items-center justify-center text-brand-blue font-bold">
                  {item.image}
                </div>
                <div>
                  <div className="font-bold text-brand-navy">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.role} • {item.clinic}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
