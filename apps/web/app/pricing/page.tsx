"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight, Zap, Shield, Crown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";
import Link from "next/link";

const comparisonData = [
  { feature: "Branch Locations", starter: "1", growth: "Up to 3", enterprise: "Unlimited", multi: "5+" },
  { feature: "Staff Accounts", starter: "5", growth: "Unlimited", enterprise: "Unlimited", multi: "Unlimited" },
  { feature: "QR Self Check-in", starter: true, growth: true, enterprise: true, multi: true },
  { feature: "HMO Management", starter: "Basic", growth: "Advanced", enterprise: "Custom", multi: "Centralized" },
  { feature: "Optical Workflow", starter: false, growth: true, enterprise: true, multi: true },
  { feature: "OCR Form Scanning", starter: false, growth: "50/mo", enterprise: "Unlimited", multi: "Unlimited" },
  { feature: "WhatsApp Notifications", starter: false, growth: true, enterprise: true, multi: true },
  { feature: "Patient Portal", starter: true, growth: true, enterprise: true, multi: true },
  { feature: "Surgery Management", starter: false, growth: false, enterprise: true, multi: true },
  { feature: "Advanced Analytics", starter: false, growth: true, enterprise: true, multi: true },
  { feature: "API Access", starter: false, growth: false, enterprise: true, multi: true },
  { feature: "Dedicated Manager", starter: false, growth: false, enterprise: true, multi: true },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { openModal } = useModals();

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: isYearly ? "99" : "120",
      desc: "For small clinics starting their digital journey.",
      features: ["1 Branch", "5 Staff Accounts", "QR Check-in", "Basic HMO Tracking"],
      color: "blue"
    },
    {
      name: "Growth",
      icon: Shield,
      price: isYearly ? "199" : "240",
      desc: "For busy clinics needing full automation.",
      features: ["3 Branches", "Unlimited Staff", "Optical Workflow", "OCR Scanning"],
      color: "brand-blue",
      popular: true
    },
    {
      name: "Multi-Branch",
      icon: Building,
      price: isYearly ? "399" : "480",
      desc: "For expanding chains and hospitals.",
      features: ["5+ Branches", "Inter-branch Transfer", "Centralized BI", "HMO Remittance"],
      color: "navy"
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Custom",
      desc: "Custom solutions for large healthcare groups.",
      features: ["Unlimited Branches", "Custom Workflows", "API Access", "White-labeling"],
      color: "gold"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
              Simple, <span className="text-brand-blue">Predictable</span> Pricing
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
              No hidden fees. No setup costs. Just powerful tools to help your eye clinic thrive.
            </p>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-bold ${!isYearly ? "text-brand-navy" : "text-slate-400"}`}>Monthly billing</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-14 h-8 bg-slate-100 rounded-full relative p-1 transition-colors"
              >
                <motion.div
                  animate={{ x: isYearly ? 24 : 0 }}
                  className="w-6 h-6 bg-brand-blue rounded-full shadow-lg"
                />
              </button>
              <span className={`text-sm font-bold ${isYearly ? "text-brand-navy" : "text-slate-400"}`}>Yearly billing</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Save 20%</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[2.5rem] bg-white border ${plan.popular ? "border-brand-blue ring-4 ring-brand-blue/5" : "border-slate-100"} shadow-xl relative flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? "bg-brand-blue text-white" : "bg-slate-50 text-slate-400"}`}>
                    <plan.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">
                    {plan.desc}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-brand-navy">{plan.price !== "Custom" ? "$" : ""}{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-sm font-medium text-slate-400">{isYearly ? "/yr" : "/mo"}</span>}
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <Check size={16} className="text-brand-blue shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.popular ? "primary" : "outline"} 
                  className="w-full py-4 rounded-2xl font-bold"
                  onClick={() => openModal(plan.price === "Custom" ? "sales" : "demo")}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Compare Features</h2>
            <p className="text-slate-500">Find the perfect match for your clinic's operational needs.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-6 px-4 border-b border-slate-100 text-sm font-bold text-brand-navy uppercase tracking-wider">Features</th>
                  <th className="py-6 px-4 border-b border-slate-100 text-sm font-bold text-brand-navy uppercase tracking-wider text-center">Starter</th>
                  <th className="py-6 px-4 border-b border-slate-100 text-sm font-bold text-brand-navy uppercase tracking-wider text-center bg-slate-50/50">Growth</th>
                  <th className="py-6 px-4 border-b border-slate-100 text-sm font-bold text-brand-navy uppercase tracking-wider text-center">Multi-Branch</th>
                  <th className="py-6 px-4 border-b border-slate-100 text-sm font-bold text-brand-navy uppercase tracking-wider text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4 border-b border-slate-50 text-sm font-medium text-slate-700">{row.feature}</td>
                    <td className="py-5 px-4 border-b border-slate-50 text-sm text-center">
                      {typeof row.starter === "boolean" ? (row.starter ? <Check className="mx-auto text-emerald-500" size={18} /> : <X className="mx-auto text-slate-300" size={18} />) : <span className="text-slate-500">{row.starter}</span>}
                    </td>
                    <td className="py-5 px-4 border-b border-slate-50 text-sm text-center bg-slate-50/30">
                      {typeof row.growth === "boolean" ? (row.growth ? <Check className="mx-auto text-emerald-500" size={18} /> : <X className="mx-auto text-slate-300" size={18} />) : <span className="font-bold text-brand-blue">{row.growth}</span>}
                    </td>
                    <td className="py-5 px-4 border-b border-slate-50 text-sm text-center">
                      {typeof row.multi === "boolean" ? (row.multi ? <Check className="mx-auto text-emerald-500" size={18} /> : <X className="mx-auto text-slate-300" size={18} />) : <span className="text-slate-500">{row.multi}</span>}
                    </td>
                    <td className="py-5 px-4 border-b border-slate-50 text-sm text-center">
                      {typeof row.enterprise === "boolean" ? (row.enterprise ? <Check className="mx-auto text-emerald-500" size={18} /> : <X className="mx-auto text-slate-300" size={18} />) : <span className="text-slate-500">{row.enterprise}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard." },
              { q: "Is there a setup fee?", a: "No, we don't charge any setup fees. Our team helps you onboard for free." },
              { q: "Do you offer custom integrations?", a: "Yes, for Enterprise and Multi-branch customers, we offer API access and custom dev." },
              { q: "What support is included?", a: "All plans include email support. Growth and above include priority WhatsApp support." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <h4 className="font-bold text-brand-navy mb-2">{item.q}</h4>
                <p className="text-sm text-slate-500">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/faq" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all">
              See all FAQs <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
