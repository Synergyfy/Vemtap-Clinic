"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck, Monitor, ArrowRight, Video } from "lucide-react";

export const QueueManagement = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
            Smart Queue & Appointments
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6">
            Intelligent <span className="text-brand-blue">Queue</span> Control
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Manage appointments and walk-ins seamlessly. Show live waiting room displays to keep patients informed and reduce perceived wait times.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Queue Dashboard */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-soft-blue rounded-xl flex items-center justify-center">
                  <Monitor className="text-brand-blue" size={20} />
                </div>
                <h4 className="font-bold text-brand-navy">Waiting Room Display</h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live View
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-brand-navy text-white rounded-3xl text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Currently Serving</div>
                  <div className="text-4xl font-bold mb-1">T-042</div>
                  <div className="text-xs text-brand-blue font-bold">Consultation Room 1</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Average Wait</div>
                    <div className="text-xl font-bold text-brand-navy">12 min</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Next Up</div>
                    <div className="text-xl font-bold text-brand-navy">T-045</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6">
                <div className="text-xs font-bold text-brand-navy mb-4 uppercase tracking-wider">Queue Timeline</div>
                <div className="space-y-4">
                  {[
                    { ticket: "T-045", status: "Next", time: "2 min" },
                    { ticket: "T-046", status: "Waiting", time: "8 min" },
                    { ticket: "T-047", status: "Waiting", time: "15 min" },
                    { ticket: "T-048", status: "Checking-in", time: "20 min" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-brand-navy">{item.ticket}</div>
                        <span className="text-xs font-medium text-slate-600">{item.status}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature Highlights */}
          <div className="space-y-6">
            {[
              { icon: Calendar, title: "Smart Scheduling", desc: "Balance walk-ins and appointments automatically." },
              { icon: UserCheck, title: "Doctor Availability", desc: "Real-time sync with doctor schedules and breaks." },
              { icon: Clock, title: "Wait Time Prediction", desc: "AI algorithms to predict and display accurate wait times." },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-brand-soft-blue rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="text-brand-blue" size={24} />
                </div>
                <h4 className="text-lg font-bold text-brand-navy mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
