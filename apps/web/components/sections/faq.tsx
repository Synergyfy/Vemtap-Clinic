"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export const FAQ = () => {
  const faqs = [
    {
      q: "How does QR check-in work?",
      a: "Each clinic gets a unique QR code. Patients scan it with their phone camera, which opens a secure web form where they can select their visit purpose, HMO details, and enter their information. This data flows instantly into your clinic's live queue.",
    },
    {
      q: "Can HMOs be managed easily?",
      a: "Yes! Vemtap is built specifically for HMO operations. You can track claims from submission to payment, analyze revenue per provider, and use AI to reduce errors in claim filing.",
    },
    {
      q: "Does it support multiple branches?",
      a: "Absolutely. Our Growth and Enterprise plans are designed for multi-location clinics. You can manage staff, inventory, and analytics across all your branches from a single admin dashboard.",
    },
    {
      q: "Can patients book appointments online?",
      a: "Yes, Vemtap includes a patient-facing booking portal. Appointments are automatically synced with your clinic's queue and doctor schedules.",
    },
    {
      q: "Does it support optical workflows?",
      a: "Yes, we have a dedicated module for lens orders, frame inventory, and lab production tracking. You can track every order from the initial eye test to the final patient pickup.",
    },
    {
      q: "Is WhatsApp supported?",
      a: "Yes, Vemtap can send automated WhatsApp notifications to patients for appointment reminders, queue status updates, and lens pickup alerts.",
    },
    {
      q: "Can we migrate from existing systems?",
      a: "Yes, our team provides full support for data migration from your current clinic management or EMR system to ensure a smooth transition with zero downtime.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-navy mb-6">Frequently Asked <span className="text-brand-blue">Questions</span></h2>
          <p className="text-lg text-slate-500">Everything you need to know about Vemtap Health.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 rounded-3xl overflow-hidden hover:border-brand-blue/30 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-brand-navy">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-slate-500 leading-relaxed text-sm">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
