"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Mail, ArrowLeft, ArrowRight, 
  Send, CheckCircle2, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 text-center">
            {!isSubmitted ? (
              <>
                <div className="w-16 h-16 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold text-brand-navy mb-4">Reset Password</h1>
                <p className="text-slate-500 text-sm mb-10">Enter your work email and we'll send you a link to reset your password.</p>

                <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="john@clinic.com"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full py-5 text-lg font-bold rounded-2xl group"
                    onClick={() => setIsSubmitted(true)}
                    disabled={!email}
                  >
                    Send Reset Link <Send size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-3xl font-bold text-brand-navy mb-4">Link Sent!</h2>
                <p className="text-slate-500 text-sm mb-10">
                  We've sent a password reset link to <span className="font-bold text-brand-navy">{email}</span>. Please check your inbox and spam folder.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full py-4 rounded-2xl mb-4"
                  onClick={() => setIsSubmitted(false)}
                >
                  Resend Link
                </Button>
              </motion.div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-100">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
