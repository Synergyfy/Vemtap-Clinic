"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, Search, HelpCircle, 
  ShieldCheck, Activity, CreditCard, Users, 
  MessageSquare, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqCategories = [
  { id: "general", name: "General", icon: HelpCircle },
  { id: "hmo", name: "HMO Questions", icon: ShieldCheck },
  { id: "optical", name: "Optical Workflow", icon: Activity },
  { id: "billing", name: "Billing & Security", icon: CreditCard },
  { id: "onboarding", name: "Onboarding", icon: Zap },
];

const faqs = [
  {
    category: "general",
    q: "What is Vemtap Health?",
    a: "Vemtap Health is an intelligent operating system designed specifically for eye clinics, optical centers, and vision care providers. It automates everything from patient check-in to HMO claims and optical lab tracking."
  },
  {
    category: "general",
    q: "How many clinics use Vemtap?",
    a: "Currently, over 500 eye clinics and optical centers worldwide trust Vemtap Health to run their daily operations."
  },
  {
    category: "hmo",
    q: "How does the HMO automation work?",
    a: "Our system automatically generates claim forms based on consultation notes, verifies insurance coverage in real-time, and reconciles remittances, reducing claim rejections by up to 90%."
  },
  {
    category: "hmo",
    q: "Do you support local and international HMOs?",
    a: "Yes, our database is pre-populated with major HMOs, and you can easily add custom insurance providers and their specific tariff plans."
  },
  {
    category: "optical",
    q: "Can I track lens production stages?",
    a: "Absolutely. You can track orders from 'Selection' to 'Lab Production', 'Quality Check', and finally 'Ready for Pickup'. Patients get automated WhatsApp alerts at each stage."
  },
  {
    category: "optical",
    q: "Does it manage frame inventory?",
    a: "Yes, our optical module includes a full inventory system with barcode support, low-stock alerts, and integrated sales reporting."
  },
  {
    category: "billing",
    q: "Is my data secure?",
    a: "Security is our top priority. We use bank-grade encryption, regular security audits, and are fully compliant with international health data protection standards (HIPAA/GDPR equivalent)."
  },
  {
    category: "billing",
    q: "Can I integrate with my local bank?",
    a: "Yes, we support integration with major payment gateways and offer bank reconciliation features to keep your accounting synchronized."
  },
  {
    category: "onboarding",
    q: "How long does it take to set up?",
    a: "Most single-branch clinics can be fully onboarded within 48 hours. Multi-branch hospitals typically take 5-7 days for a complete rollout and staff training."
  },
  {
    category: "onboarding",
    q: "Do you provide staff training?",
    a: "Yes, every Growth and Enterprise plan comes with comprehensive remote or on-site training sessions for your entire team."
  }
];

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors px-4 rounded-xl"
      >
        <span className="font-bold text-brand-navy pr-8">{q}</span>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-brand-blue text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pb-6 px-4 text-slate-500 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
              How can we <span className="text-brand-blue">Help</span>?
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Find answers to common questions about Vemtap Health, HMO management, optical workflows, and more.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-100 border border-slate-200 text-brand-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:bg-white transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories & FAQs */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeCategory === "all" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "bg-white text-slate-600 hover:bg-slate-100"}`}
              >
                <HelpCircle size={20} /> All Questions
              </button>
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeCategory === cat.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  <cat.icon size={20} /> {cat.name}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                {filteredFaqs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {filteredFaqs.map((faq, idx) => (
                      <FAQItem key={idx} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-2">No answers found</h3>
                    <p className="text-slate-500">Try searching for different keywords or select a category.</p>
                  </div>
                )}
              </div>
              
              {/* Contact Help */}
              <div className="mt-12 p-8 rounded-[2rem] bg-brand-soft-blue border border-brand-blue/10 flex flex-col md:row items-center justify-between gap-8">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm shrink-0 mx-auto md:mx-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Still have questions?</h4>
                    <p className="text-sm text-slate-500">We're here to help you 24/7. Talk to our support team.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="primary">Chat with Us</Button>
                  <Button variant="outline">Email Support</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
