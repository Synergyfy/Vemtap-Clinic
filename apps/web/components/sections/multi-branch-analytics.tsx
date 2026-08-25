"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BarChart, Globe, MapPin, TrendingUp } from "lucide-react";

export const MultiBranchAnalytics = () => {
  return (
    <section className="py-24 bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-sm font-semibold mb-6">
            Enterprise Scale
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Monitor <span className="text-brand-blue">All Branches</span> From One Dashboard
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed">
            Whether you run two clinics or two hundred, Vemtap gives you the bird's-eye view you need to stay in control of operations and growth.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {[
              { label: "Total Revenue", value: "$248,500", trend: "+14.2%", icon: TrendingUp },
              { label: "Total Patients", value: "12,480", trend: "+8.5%", icon: Users },
              { label: "Active Branches", value: "24", trend: "0%", icon: MapPin },
              { label: "Avg NPS", value: "4.8/5", trend: "+2.1%", icon: BarChart },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
                    <stat.icon className="text-brand-blue" size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">{stat.trend}</span>
                </div>
                <div className="text-sm font-medium text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/5 rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold">Branch Performance Comparison</h4>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-blue"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: "Lagos Main Clinic", rev: "$84k", patients: "2.4k", status: "Optimal" },
                  { name: "Abuja Vision Center", rev: "$62k", patients: "1.8k", status: "High Load" },
                  { name: "Port Harcourt Eye", rev: "$45k", patients: "1.2k", status: "Optimal" },
                ].map((branch, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                      <div>
                        <div className="font-bold text-sm">{branch.name}</div>
                        <div className="text-[10px] text-slate-400">{branch.patients} Patients • {branch.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-blue">{branch.rev}</div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Monthly Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-blue rounded-3xl p-8 flex flex-col justify-between text-white relative overflow-hidden">
              <Globe className="absolute -bottom-20 -right-20 w-64 h-64 opacity-20" />
              <div>
                <h4 className="text-2xl font-bold mb-4">Scale with Confidence</h4>
                <p className="text-blue-100/80 leading-relaxed mb-8">
                  Vemtap is designed for multi-branch operations. Sync data in real-time across all locations and manage everything from a single account.
                </p>
              </div>
              <button className="w-full py-4 bg-white text-brand-blue font-bold rounded-2xl shadow-xl">
                View Enterprise Solutions
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
