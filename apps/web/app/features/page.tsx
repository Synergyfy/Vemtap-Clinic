"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  QrCode, ShieldCheck, Activity, Users, Calendar, Scan, 
  LayoutDashboard, Bell, BarChart, Smartphone, Package, CreditCard,
  Stethoscope, Pill, ClipboardList, TrendingUp, Globe, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";

const FeatureCategory = ({ title, description, features }: { title: string, description: string, features: any[] }) => (
  <div className="mb-20">
    <div className="mb-10">
      <h3 className="text-3xl font-bold text-brand-navy mb-4">{title}</h3>
      <p className="text-slate-500 max-w-2xl">{description}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -5 }}
          className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mb-6">
            <feature.icon size={24} />
          </div>
          <h4 className="text-lg font-bold text-brand-navy mb-3">{feature.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default function FeaturesPage() {
  const { openModal } = useModals();

  const categories = [
    {
      title: "Patient Experience",
      description: "Modernize how patients interact with your clinic from the moment they arrive.",
      features: [
        { icon: QrCode, title: "QR Self Check-In", desc: "Patients can check themselves in via QR codes, reducing front desk congestion." },
        { icon: Smartphone, title: "Patient Portal", desc: "Mobile-friendly portal for patients to view history, prescriptions, and book appointments." },
        { icon: Bell, title: "WhatsApp Notifications", desc: "Automated reminders for appointments, lens pickups, and follow-ups via WhatsApp." },
        { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered appointment booking that syncs with doctor availability in real-time." },
        { icon: Activity, title: "Queue Management", desc: "Live waiting room displays and ticket systems to keep patient flow smooth." },
        { icon: ClipboardList, title: "Smart Intake Forms", desc: "Digital patient intake forms that automatically populate medical records." },
      ]
    },
    {
      title: "Clinical Workflow",
      description: "Empower doctors and nurses with specialized tools for eye care.",
      features: [
        { icon: Stethoscope, title: "Doctor Workspace", desc: "Tailored interface for ophthalmologists with quick entry for eye exam results." },
        { icon: Activity, title: "Advanced Eye Exams", desc: "Modules for refraction, IOP, slit lamp exams, and fundoscopy recording." },
        { icon: Scan, title: "OCR Form Scanning", desc: "Extract data instantly from paper prescriptions and HMO cards using AI." },
        { icon: Activity, title: "Medical Imaging", desc: "Upload and manage retina scans, OCT images, and fundus photography." },
        { icon: ClipboardList, title: "Surgery Management", desc: "End-to-end workflow for theater booking, pre-op, and post-op care." },
        { icon: Pill, title: "Pharmacy & E-Prescribing", desc: "Integrated pharmacy inventory with digital prescription fulfillment." },
      ]
    },
    {
      title: "Operations & Management",
      description: "Scale your business with enterprise-grade management tools.",
      features: [
        { icon: ShieldCheck, title: "HMO Management", desc: "Automated claim generation, remittance reconciliation, and debt tracking." },
        { icon: Package, title: "Optical & Lens Tracking", desc: "Manage frames, track lens production stages, and notify patients on ready." },
        { icon: LayoutDashboard, title: "Multi-Branch Support", desc: "Centralized monitoring of revenue, stock, and staff across all locations." },
        { icon: BarChart, title: "Advanced Analytics", desc: "Real-time BI dashboards for clinical, financial, and operational trends." },
        { icon: CreditCard, title: "Billing & Accounting", desc: "Full accounting system with ledger, P&L, and integrated POS." },
        { icon: Lock, title: "Security & Compliance", desc: "Enterprise security with audit logs and health data protection compliance." },
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
              The Most Complete <br />
              <span className="text-brand-blue">Eye Clinic</span> OS
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Every feature you need to run a modern, efficient, and profitable eye care practice. From patient check-in to HMO reconciliation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="primary" onClick={() => openModal("demo")}>Request Full Demo</Button>
              <Button size="lg" variant="outline" onClick={() => openModal("tour")}>Watch Product Tour</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {categories.map((cat, i) => (
            <FeatureCategory key={i} {...cat} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-navy mb-6">Ready to see it in action?</h2>
          <p className="text-slate-500 mb-10 max-w-2xl mx-auto">Get a personalized tour of how Vemtap can transform your specific clinic workflow.</p>
          <Button size="lg" variant="primary" className="px-12" onClick={() => openModal("demo")}>Book Your Live Demo</Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
