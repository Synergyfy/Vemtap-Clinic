"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, MessageSquare, 
  Send, Clock, Globe, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/lib/modal-context";

export default function ContactPage() {
  const { openModal } = useModals();

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
              Get in <span className="text-brand-blue">Touch</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about Vemtap Health? Our team is here to help you find the right solution for your clinic.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50"
            >
              <h2 className="text-3xl font-bold text-brand-navy mb-8">Send us a Message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all" placeholder="john@clinic.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subject</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none">
                    <option>Sales Inquiry</option>
                    <option>Technical Support</option>
                    <option>Partnership Opportunity</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Message</label>
                  <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all min-h-[150px]" placeholder="How can we help you?"></textarea>
                </div>

                <Button className="w-full py-5 text-lg font-bold rounded-2xl gap-2 group">
                  Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-brand-navy mb-8">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Mail, title: "Email Us", val: "hello@vemtap.com", sub: "Support: support@vemtap.com" },
                    { icon: Phone, title: "Call Us", val: "+234 (0) 800 VEMTAP", sub: "Mon-Fri, 8am - 6pm" },
                    { icon: MessageSquare, title: "WhatsApp", val: "+234 812 345 6789", sub: "Instant chat support" },
                    { icon: MapPin, title: "Visit Us", val: "Lagos, Nigeria", sub: "Abuja, Nigeria" },
                  ].map((item, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-brand-soft-blue text-brand-blue rounded-xl flex items-center justify-center mb-4">
                        <item.icon size={24} />
                      </div>
                      <h4 className="font-bold text-brand-navy mb-1">{item.title}</h4>
                      <div className="text-sm font-bold text-brand-blue mb-1">{item.val}</div>
                      <div className="text-xs text-slate-500">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-brand-navy text-white">
                <h3 className="text-xl font-bold mb-6">Why talk to us?</h3>
                <div className="space-y-4">
                  {[
                    { icon: Clock, text: "Get a personalized demo in 24 hours" },
                    { icon: ShieldCheck, text: "Consult with our workflow experts" },
                    { icon: Globe, text: "Learn how we support multi-branch clinics" }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <f.icon size={16} className="text-brand-blue" />
                      </div>
                      <span className="text-slate-300 text-sm">{f.text}</span>
                    </div>
                  ))}
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
