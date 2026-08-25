"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: isYearly ? "99" : "120",
      desc: "Perfect for single branch clinics just starting with automation.",
      features: [
        "1 Branch Location",
        "Up to 5 Staff Accounts",
        "QR Self Check-in",
        "Basic Queue Management",
        "HMO Tracking",
        "Email Support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth",
      price: isYearly ? "199" : "240",
      desc: "For busy clinics needing advanced workflows and OCR.",
      features: [
        "Up to 3 Branch Locations",
        "Unlimited Staff Accounts",
        "OCR Document Scanning",
        "Optical Workflow Automation",
        "HMO Analytics & Reports",
        "WhatsApp Notifications",
        "Priority Support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For large chains and healthcare groups with custom needs.",
      features: [
        "Unlimited Branch Locations",
        "Custom Workflow Integration",
        "Dedicated Account Manager",
        "API Access",
        "Custom Branding",
        "On-site Training",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Simple, <span className="text-brand-blue">Transparent</span> Pricing</h2>
          <p className="text-xl text-slate-500 mb-10">Choose the plan that fits your clinic's growth stage.</p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isYearly ? "text-brand-navy" : "text-slate-400"}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-slate-100 rounded-full relative p-1 transition-colors"
            >
              <motion.div
                animate={{ x: isYearly ? 24 : 0 }}
                className="w-6 h-6 bg-brand-blue rounded-full shadow-lg"
              />
            </button>
            <span className={`text-sm font-bold ${isYearly ? "text-brand-navy" : "text-slate-400"}`}>Yearly</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Save 20%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-[3rem] border ${
                plan.popular ? "bg-brand-navy text-white border-brand-navy shadow-2xl scale-105" : "bg-white border-slate-100 shadow-xl"
              } relative overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-bold px-6 py-1.5 rotate-45 translate-x-6 translate-y-4 uppercase tracking-widest">
                  Popular
                </div>
              )}
              
              <div className="mb-8">
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price !== "Custom" ? "$" : ""}{plan.price}</span>
                  {plan.price !== "Custom" && <span className={`text-sm font-medium ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{isYearly ? "/yr" : "/mo"}</span>}
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-brand-blue text-white" : "bg-brand-soft-blue text-brand-blue"}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "primary" : "outline"}
                className="w-full py-4 text-base font-bold rounded-2xl"
                onClick={() => openModal(plan.cta === "Contact Sales" ? "sales" : "demo")}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
