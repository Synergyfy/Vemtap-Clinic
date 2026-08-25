"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Building2, Eye, Glasses, Stethoscope, Microscope, 
  ArrowRight, ShieldCheck, Activity, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";
import Link from "next/link";

const industries = [
  {
    title: "Eye Clinics",
    slug: "eye-clinics",
    icon: Building2,
    desc: "Comprehensive workflow automation for general eye care practices, from patient intake to billing.",
    features: ["Queue Management", "Patient Records", "HMO Billing"]
  },
  {
    title: "Optical Centers",
    slug: "optical-centers",
    icon: Glasses,
    desc: "Specialized tools for frame inventory, lens production tracking, and retail sales management.",
    features: ["Lens Tracking", "Inventory Control", "Retail POS"]
  },
  {
    title: "Vision Clinics",
    slug: "vision-clinics",
    icon: Eye,
    desc: "Tailored solutions for primary vision care providers focusing on exams and prescriptions.",
    features: ["Auto-Refraction Sync", "Prescription History", "WhatsApp Alerts"]
  },
  {
    title: "Ophthalmology Centers",
    slug: "ophthalmology-centers",
    icon: Stethoscope,
    desc: "Advanced clinical modules for surgical management, imaging, and complex patient histories.",
    features: ["Surgery Workflow", "Imaging Gallery", "Clinical Notes"]
  },
  {
    title: "Specialist Clinics",
    slug: "specialist-clinics",
    icon: Microscope,
    desc: "Customizable workflows for glaucoma, retina, and pediatric ophthalmology specialists.",
    features: ["Specialized Exams", "Research Analytics", "Referral Tracking"]
  }
];

export default function IndustriesPage() {
  const { openModal } = useModals();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
                Tailored Solutions for Every <br />
                <span className="text-brand-blue">Eye Care</span> Sector
              </h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                Vemtap Health is designed to adapt to the unique workflows of different eye care environments. Choose your sector to see how we help you scale.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="primary" onClick={() => openModal("demo")}>Get Started</Button>
                <Button size="lg" variant="outline" onClick={() => openModal("sales")}>Talk to Sales</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industry Cards */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col group"
              >
                <div className="w-14 h-14 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <industry.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">{industry.title}</h3>
                <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                  {industry.desc}
                </p>
                
                <div className="space-y-3 mb-8">
                  {industry.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                      {f}
                    </div>
                  ))}
                </div>

                <Link 
                  href={`/industries/${industry.slug}`}
                  className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all"
                >
                  Learn More <ArrowRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">Trusted by leaders in</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center font-bold text-2xl italic">CLINIC ONE</div>
            <div className="flex items-center justify-center font-bold text-2xl italic">VISION HUB</div>
            <div className="flex items-center justify-center font-bold text-2xl italic">EYE CARE+</div>
            <div className="flex items-center justify-center font-bold text-2xl italic">OPTIX</div>
            <div className="flex items-center justify-center font-bold text-2xl italic">SIGHTPRO</div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
