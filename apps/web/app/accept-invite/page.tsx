"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Mail, UserPlus, CheckCircle2, 
  ArrowRight, ShieldCheck, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InviteAcceptancePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 text-center">
            <div className="w-16 h-16 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-8">
              <UserPlus size={32} />
            </div>
            <h1 className="text-3xl font-bold text-brand-navy mb-4">You're Invited!</h1>
            <p className="text-slate-500 text-sm mb-10">
              <span className="font-bold text-brand-navy">Vision Eye Clinic</span> has invited you to join their team as a <span className="font-bold text-brand-blue">Clinic Administrator</span>.
            </p>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-brand-blue" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-navy">Vision Eye Clinic</div>
                  <div className="text-xs text-slate-400">Main Branch • Lagos</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-navy">Role: Clinic Admin</div>
                  <div className="text-xs text-slate-400">Full Access</div>
                </div>
              </div>
            </div>

            <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Set Your Password</label>
                <input
                  type="password"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <Link href="/dashboard" className="block w-full">
                <Button variant="primary" className="w-full py-5 text-lg font-bold rounded-2xl group">
                  Accept Invitation <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </form>

            <p className="mt-8 text-xs text-slate-400">
              By accepting, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
