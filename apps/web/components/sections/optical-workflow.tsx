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

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
              Optical Intelligence
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6 leading-tight">
              Complete <span className="text-brand-blue">Optical Workflow</span> Automation
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Track every lens order from prescription to production and pickup. Manage frame inventory and notify patients automatically when their glasses are ready.
            </p>

            <div className="flex items-center justify-between relative mb-12">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
              {workflow.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                    step.status === "completed" ? "bg-brand-blue border-brand-soft-blue text-white" :
                    step.status === "active" ? "bg-white border-brand-blue text-brand-blue animate-pulse" :
                    "bg-white border-slate-100 text-slate-300"
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    step.status === "pending" ? "text-slate-300" : "text-brand-navy"
                  }`}>{step.title}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                "Lens Order Tracking",
                "Frame Inventory Management",
                "Lab Production Sync",
                "Quality Assurance Check",
                "Automated Pickup Alerts",
                "Optical Billing Integration"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Optical Dashboard Mockup */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-soft-blue rounded-xl flex items-center justify-center">
                    <Box className="text-brand-blue" size={20} />
                  </div>
                  <h4 className="font-bold text-brand-navy text-lg">Inventory & Lab</h4>
                </div>
                <div className="text-[10px] text-brand-blue font-bold px-3 py-1 bg-brand-soft-blue rounded-full">8 Orders in Lab</div>
              </div>

              <div className="space-y-6">
                {[
                  { id: "#ORD-992", name: "Sarah Johnson", type: "Progressive", status: "Production", progress: 65 },
                  { id: "#ORD-995", name: "Mike Chen", type: "Single Vision", status: "Quality Check", progress: 90 },
                  { id: "#ORD-998", name: "Emma Wilson", type: "Bifocal", status: "Eye Test", progress: 20 },
                ].map((order, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-brand-navy">{order.name} <span className="text-slate-400 font-medium ml-2">{order.id}</span></div>
                        <div className="text-[10px] text-slate-500">{order.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-brand-blue mb-1">{order.status}</div>
                        <div className="text-[9px] text-slate-400">{order.progress}% Ready</div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${order.progress}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-brand-blue rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
