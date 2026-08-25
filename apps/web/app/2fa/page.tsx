"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Smartphone, ShieldCheck, ArrowRight, 
  ArrowLeft, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TwoFactorPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    
    // Auto-focus next
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 text-center">
            <div className="w-16 h-16 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Smartphone size={32} />
            </div>
            <h1 className="text-3xl font-bold text-brand-navy mb-4">Two-Step Verification</h1>
            <p className="text-slate-500 text-sm mb-10">We've sent a 6-digit code to your registered mobile device. Please enter it below.</p>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="flex justify-between gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-black rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-brand-blue focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>

              <Link href="/dashboard" className="block w-full">
                <Button variant="primary" className="w-full py-5 text-lg font-bold rounded-2xl">
                  Verify & Continue
                </Button>
              </Link>
              
              <button className="flex items-center gap-2 text-sm font-bold text-slate-400 mx-auto hover:text-brand-blue transition-colors">
                <RefreshCw size={16} /> Resend Code
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 opacity-50">
              <ShieldCheck size={16} className="text-brand-blue" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secure Verification</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
