"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Database, ShieldCheck, Pill, Eye, 
  Frame, ClipboardList, Zap, Settings2,
  Plus, Search, Filter, MoreVertical,
  CheckCircle2, Globe, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const configModules = [
  { 
    title: "HMO Database", 
    desc: "Manage global insurance providers, tariff plans, and coverage rules.",
    icon: ShieldCheck,
    count: "124 Providers",
    color: "blue",
    href: "/admin/config/hmo"
  },
  { 
    title: "Drug Database", 
    desc: "Global pharmacy catalog with drug names, categories, and inventory defaults.",
    icon: Pill,
    count: "4,250 Items",
    color: "emerald",
    href: "/admin/config/drugs"
  },
  { 
    title: "Lens Catalog", 
    desc: "Standardize lens types, coatings, and global pricing benchmarks.",
    icon: Eye,
    count: "840 Types",
    color: "brand-blue",
    href: "/admin/config/lenses"
  },
  { 
    title: "Frames Catalog", 
    desc: "Global frame directory with brand, material, and style tracking.",
    icon: Frame,
    count: "15,400 Styles",
    color: "purple",
    href: "/admin/config/frames"
  },
  { 
    title: "Consultation Templates", 
    desc: "Standardized exam forms for general eye checkups, glaucoma, etc.",
    icon: ClipboardList,
    count: "12 Templates",
    color: "amber",
    href: "/admin/config/templates"
  },
  { 
    title: "Workflow Blueprints", 
    desc: "Configure default clinical and operational paths for different clinic types.",
    icon: Zap,
    count: "5 Workflows",
    color: "rose",
    href: "/admin/config/workflows"
  },
];

export default function ConfigHubPage() {
  return (
    <div className="space-y-6 lg:space-y-10 pb-10">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-navy font-black tracking-tight">Healthcare Configuration</h1>
          <p className="text-sm lg:text-base text-slate-500 mt-1">Global system settings and standardized healthcare databases.</p>
        </div>
        <Button variant="outline" size="sm" className="w-full md:w-auto gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
          <Settings2 size={16} /> <span className="md:inline">Global Settings</span>
        </Button>
      </div>

      {/* Grid - Responsive Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {configModules.map((module, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              <div className={cn(
                "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors shrink-0",
                module.color === "blue" ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                module.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                module.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white" :
                module.color === "purple" ? "bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white" :
                module.color === "amber" ? "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white" :
                "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
              )}>
                <module.icon size={24} className="lg:hidden" />
                <module.icon size={28} className="hidden lg:block" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-brand-navy mb-2">{module.title}</h3>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                {module.desc}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{module.count}</span>
                <Link href={module.href}>
                  <Button variant="ghost" size="sm" className="text-brand-blue font-bold gap-2 p-0 hover:bg-transparent hover:gap-3 transition-all text-xs lg:text-sm">
                    Configure <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box - Mobile Responsive */}
      <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-brand-navy text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10 relative z-10 text-center md:text-left">
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Database size={28} className="text-brand-blue lg:w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg lg:text-xl font-bold mb-2">Centralized Healthcare Standards</h3>
            <p className="text-slate-400 text-xs lg:text-sm max-w-2xl leading-relaxed">
              Changes made here affect all clinics across the platform. Use these tools to ensure data integrity and standardize clinical workflows for eye care providers.
            </p>
          </div>
          <Button className="w-full md:w-auto bg-white text-brand-navy hover:bg-slate-100 font-bold shrink-0 h-12 px-8 rounded-xl shadow-lg">
            Backup Database
          </Button>
        </div>
      </div>
    </div>
  );
}
