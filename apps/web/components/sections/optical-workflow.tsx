"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Package, Settings, CheckCircle, Bell, Box } from "lucide-react";

export const OpticalWorkflow = () => {
  const workflow = [
    { icon: Eye, title: "Eye Test", status: "completed" },
    { icon: Package, title: "Lens Selection", status: "completed" },
    { icon: Settings, title: "Production", status: "active" },
    { icon: CheckCircle, title: "Quality Check", status: "pending" },
    { icon: Bell, title: "Pickup Alert", status: "pending" },
  ];

  const workflowFeatures = [
    "Lens Order Tracking",
    "Frame Inventory Management",
    "Lab Production Sync",
    "Quality Assurance Check",
    "Automated Pickup Alerts",
    "Optical Billing Integration",
  ];

  return (
    <section className="py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-brand-blue">
              Optical Intelligence
            </div>
            <h2 className="mb-6 text-4xl font-bold leading-tight text-brand-navy md:text-5xl">
              Complete <span className="text-brand-blue">Optical Workflow</span> Automation
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-xl lg:mb-10">
              Track every lens order from prescription to production and pickup. Manage frame inventory and notify patients automatically when their glasses are ready.
            </p>

            <div className="mb-8 hidden md:block">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-slate-100"></div>
                {workflow.map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                      step.status === "completed" ? "border-brand-soft-blue bg-brand-blue text-white" :
                      step.status === "active" ? "border-brand-blue bg-white text-brand-blue animate-pulse" :
                      "border-slate-100 bg-white text-slate-300"
                    }`}>
                      <step.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      step.status === "pending" ? "text-slate-300" : "text-brand-navy"
                    }`}>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <div className="-mx-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max snap-x snap-mandatory gap-3 px-2">
                  {workflow.map((step, idx) => (
                    <div key={idx} className="snap-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm min-w-[150px]">
                      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full border-4 ${
                        step.status === "completed" ? "border-brand-soft-blue bg-brand-blue text-white" :
                        step.status === "active" ? "border-brand-blue bg-white text-brand-blue animate-pulse" :
                        "border-slate-100 bg-slate-50 text-slate-300"
                      }`}>
                        <step.icon size={18} />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Step {idx + 1}</div>
                      <div className="mt-1 text-sm font-bold text-brand-navy">{step.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-2 md:gap-4">
              {workflowFeatures.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                  {item}
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <div className="-mx-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max snap-x snap-mandatory gap-3 px-2">
                  {workflowFeatures.map((item) => (
                    <div key={item} className="snap-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 min-w-[190px]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Optical Dashboard Mockup */}
            <div className="relative z-10 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-2xl sm:p-6 lg:rounded-[2.5rem] lg:p-8">
              <div className="mb-6 flex items-center justify-between gap-2 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft-blue sm:h-10 sm:w-10">
                    <Box className="text-brand-blue" size={18} />
                  </div>
                  <h4 className="text-base font-bold text-brand-navy sm:text-lg">Inventory & Lab</h4>
                </div>
                <div className="rounded-full bg-brand-soft-blue px-2 py-1 text-[9px] font-bold text-brand-blue sm:px-3 sm:text-[10px]">8 Orders in Lab</div>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {[
                  { id: "#ORD-992", name: "Sarah Johnson", type: "Progressive", status: "Production", progress: 65 },
                  { id: "#ORD-995", name: "Mike Chen", type: "Single Vision", status: "Quality Check", progress: 90 },
                  { id: "#ORD-998", name: "Emma Wilson", type: "Bifocal", status: "Eye Test", progress: 20 },
                ].map((order, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-brand-navy sm:text-sm">
                          {order.name} <span className="ml-2 font-medium text-slate-400">{order.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{order.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-[9px] font-bold text-brand-blue sm:text-[10px]">{order.status}</div>
                        <div className="text-[8px] text-slate-400 sm:text-[9px]">{order.progress}% Ready</div>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${order.progress}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-brand-blue"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-blue/10 blur-3xl sm:-right-10 sm:-top-10 sm:h-40 sm:w-40"></div>
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-blue-400/10 blur-3xl sm:-bottom-10 sm:-left-10 sm:h-32 sm:w-32"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
