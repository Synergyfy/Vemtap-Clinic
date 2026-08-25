"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useModals } from "@/lib/modal-context";

export const FinalCTA = () => {
  const { openModal } = useModals();

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-navy rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-sm font-bold mb-8">
              <Sparkles size={16} />
              Ready to transform your clinic?
            </div>
            
            <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Run Your Eye Clinic <br />
              <span className="text-brand-blue font-black italic">Smarter</span> Today
            </h2>
            
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Automate workflows, reduce queues, improve patient experience, and manage operations from one intelligent platform. Join 500+ clinics worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary" size="lg" className="px-12 py-5 text-lg font-bold rounded-2xl group" onClick={() => openModal("demo")}>
                Start Free Trial <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="dark" size="lg" className="px-12 py-5 text-lg font-bold rounded-2xl border border-white/10 hover:bg-white/5" onClick={() => openModal("sales")}>
                Contact Sales
              </Button>
            </div>
            
            <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
