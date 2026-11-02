"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BarChart, Globe, MapPin, TrendingUp } from "lucide-react";

export const MultiBranchAnalytics = () => {
  return (
    <section className="bg-brand-navy py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-blue/20 px-3 py-1 text-sm font-semibold text-brand-blue">
            Enterprise Scale
          </div>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Monitor <span className="text-brand-blue">All Branches</span> From One Dashboard
          </h2>
          <p className="text-base leading-relaxed text-slate-400 sm:text-xl">
            Whether you run two clinics or two hundred, Vemtap gives you the bird&apos;s-eye view you need to stay in control of operations and growth.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 lg:rounded-[3rem] lg:p-12">
          <div className="mb-8 hidden gap-4 lg:mb-12 lg:grid lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: "$248,500", trend: "+14.2%", icon: TrendingUp },
              { label: "Total Patients", value: "12,480", trend: "+8.5%", icon: Users },
              { label: "Active Branches", value: "24", trend: "0%", icon: MapPin },
              { label: "Avg NPS", value: "4.8/5", trend: "+2.1%", icon: BarChart },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/20">
                    <stat.icon className="text-brand-blue" size={20} />
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">{stat.trend}</span>
                </div>
                <div className="mb-1 text-sm font-medium text-slate-400">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="lg:hidden">
            <div className="-mx-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max snap-x snap-mandatory gap-3 px-2">
                {[
                  { label: "Total Revenue", value: "$248,500", trend: "+14.2%", icon: TrendingUp },
                  { label: "Total Patients", value: "12,480", trend: "+8.5%", icon: Users },
                  { label: "Active Branches", value: "24", trend: "0%", icon: MapPin },
                  { label: "Avg NPS", value: "4.8/5", trend: "+2.1%", icon: BarChart },
                ].map((stat, idx) => (
                  <div key={idx} className="min-w-[220px] snap-center rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/20">
                        <stat.icon className="text-brand-blue" size={18} />
                      </div>
                      <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">{stat.trend}</span>
                    </div>
                    <div className="mb-1 text-xs font-medium text-slate-400">{stat.label}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:col-span-2 lg:p-8">
              <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
                <h4 className="text-base font-bold sm:text-lg">Branch Performance Comparison</h4>
                <div className="flex gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-blue sm:h-3 sm:w-3"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400 sm:h-3 sm:w-3"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700 sm:h-3 sm:w-3"></div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {[
                  { name: "Lagos Main Clinic", rev: "$84k", patients: "2.4k", status: "Optimal" },
                  { name: "Abuja Vision Center", rev: "$62k", patients: "1.8k", status: "High Load" },
                  { name: "Port Harcourt Eye", rev: "$45k", patients: "1.2k", status: "Optimal" },
                ].map((branch, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 sm:p-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold sm:h-10 sm:w-10">{idx + 1}</div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold sm:text-sm">{branch.name}</div>
                        <div className="text-[9px] text-slate-400 sm:text-[10px]">{branch.patients} Patients • {branch.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-blue sm:text-base">{branch.rev}</div>
                      <div className="text-[8px] font-bold uppercase tracking-tighter text-slate-500 sm:text-[9px]">Monthly Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl bg-brand-blue p-5 text-white sm:p-6 lg:p-8">
              <Globe className="absolute -bottom-20 -right-20 h-52 w-52 opacity-20 sm:h-64 sm:w-64" />
              <div>
                <h4 className="mb-3 text-xl font-bold sm:text-2xl">Scale with Confidence</h4>
                <p className="mb-6 text-sm leading-relaxed text-blue-100/80 sm:text-base">
                  Vemtap is designed for multi-branch operations. Sync data in real-time across all locations and manage everything from a single account.
                </p>
              </div>
              <button className="relative z-10 w-full rounded-2xl bg-white py-3 text-sm font-bold text-brand-blue shadow-xl sm:py-4">
                View Enterprise Solutions
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
