"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck, Monitor, ArrowRight, Video } from "lucide-react";

export const QueueManagement = () => {
  return (
    <section className="bg-slate-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-brand-blue">
            Smart Queue & Appointments
          </div>
          <h2 className="mb-6 text-4xl font-bold text-brand-navy md:text-5xl">
            Intelligent <span className="text-brand-blue">Queue</span> Control
          </h2>
          <p className="text-base leading-relaxed text-slate-600 sm:text-xl">
            Manage appointments and walk-ins seamlessly. Show live waiting room displays to keep patients informed and reduce perceived wait times.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left: Queue Dashboard */}
          <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-xl sm:p-6 lg:col-span-2 lg:rounded-[2.5rem] lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft-blue sm:h-12 sm:w-12">
                  <Monitor className="text-brand-blue" size={20} />
                </div>
                <h4 className="text-base font-bold text-brand-navy sm:text-lg">Waiting Room Display</h4>
              </div>
              <div className="flex items-center gap-2 self-start text-[9px] font-bold uppercase text-emerald-600 sm:self-auto sm:text-[10px]">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live View
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-3xl bg-brand-navy p-4 text-center text-white sm:p-6">
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[10px]">Currently Serving</div>
                  <div className="mb-1 text-3xl font-bold sm:text-4xl">T-042</div>
                  <div className="text-[10px] font-bold text-brand-blue sm:text-xs">Consultation Room 1</div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                    <div className="mb-1 text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">Average Wait</div>
                    <div className="text-lg font-bold text-brand-navy sm:text-xl">12 min</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                    <div className="mb-1 text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">Next Up</div>
                    <div className="text-lg font-bold text-brand-navy sm:text-xl">T-045</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 sm:p-6">
                <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-brand-navy sm:text-xs">Queue Timeline</div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { ticket: "T-045", status: "Next", time: "2 min" },
                    { ticket: "T-046", status: "Waiting", time: "8 min" },
                    { ticket: "T-047", status: "Waiting", time: "15 min" },
                    { ticket: "T-048", status: "Checking-in", time: "20 min" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[9px] font-black text-brand-navy shadow-sm sm:h-8 sm:w-8 sm:text-[10px]">{item.ticket}</div>
                        <span className="text-[11px] font-medium text-slate-600 sm:text-xs">{item.status}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 sm:text-[10px]">{item.time}</span>
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
