"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Target, Eye, Lightbulb, Users, Heart, 
  ShieldCheck, Globe, Trophy, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";

export default function AboutPage() {
  const { openModal } = useModals();

  const values = [
    { icon: Heart, title: "Patient-First", desc: "We build technology that puts patient comfort and outcomes at the center of every workflow." },
    { icon: ShieldCheck, title: "Clinical Integrity", desc: "Our platform is designed to maintain the highest standards of medical data accuracy and security." },
    { icon: Lightbulb, title: "Innovation", desc: "We constantly push the boundaries of what's possible in eye care automation and AI." },
    { icon: Globe, title: "Accessibility", desc: "Our goal is to make advanced eye clinic management accessible to clinics of all sizes, everywhere." },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-semibold mb-6">
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
              Revolutionizing <span className="text-brand-blue">Eye Care</span> <br />
              Through Intelligent Automation
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
              Vemtap Health started with a simple observation: eye clinics were drowning in paperwork and manual workflows. We set out to build the most intelligent operating system for eye care providers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-12 rounded-[3rem] bg-brand-navy text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <Target className="text-brand-blue mb-8" size={48} />
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                To empower eye care professionals with intelligent tools that eliminate administrative friction, improve clinical outcomes, and elevate the patient experience.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="p-12 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <Eye className="text-brand-blue mb-8" size={48} />
              <h2 className="text-3xl font-bold text-brand-navy mb-6">Our Vision</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                A world where every eye clinic, regardless of size or location, has access to the cutting-edge technology they need to provide world-class vision care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Values that Drive Us</h2>
            <p className="text-slate-500">The core principles that guide every feature we build.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <v.icon size={28} />
                </div>
                <h4 className="text-lg font-bold text-brand-navy mb-3">{v.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Innovation */}
      <section className="py-24 bg-brand-navy text-white overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/10 blur-[100px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 leading-tight">Healthcare Innovation <br />is in our DNA</h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                We don't just build software; we solve clinical problems. Our team consists of healthcare veterans, AI researchers, and workflow experts who understand the nuances of ophthalmology.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "AI-powered OCR for instant data extraction",
                  "Predictive queue modeling for smoother patient flow",
                  "Blockchain-ready clinical audit trails",
                  "Cloud-native architecture for multi-branch sync"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="primary" onClick={() => openModal("tour")}>Experience the Innovation</Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center p-12">
                <Trophy size={120} className="text-brand-blue opacity-50" />
              </div>
              <div className="absolute -top-10 -right-10 bg-brand-blue p-8 rounded-3xl shadow-2xl">
                <div className="text-3xl font-black">500+</div>
                <div className="text-sm font-bold opacity-80">Clinics Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-navy mb-8">Join the Future of Eye Care</h2>
          <p className="text-xl text-slate-500 mb-10">Be part of the thousands of professionals who are transforming their clinics with Vemtap Health.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="primary" onClick={() => openModal("demo")}>Get Started Today</Button>
            <Button size="lg" variant="outline" onClick={() => openModal("sales")}>Contact Sales</Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
