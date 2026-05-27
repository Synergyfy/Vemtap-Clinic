"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Smartphone, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12">
            <div className="text-center mb-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-xl font-bold text-brand-navy">Vemtap</span>
              </Link>
              <h1 className="text-3xl font-bold text-brand-navy mb-2">Welcome Back</h1>
              <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                    placeholder="john@clinic.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-brand-blue hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
                <label htmlFor="remember" className="text-xs text-slate-500 font-medium">Keep me logged in for 30 days</label>
              </div>

              {/* Login Dropdown */}
              <div className="relative group">
                <Button variant="primary" className="w-full py-5 text-lg font-bold rounded-2xl shadow-lg shadow-brand-blue/20">
                  Login to Dashboard
                </Button>
                <div className="absolute top-full left-0 w-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-2">
                    <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                      Super Admin Dashboard
                    </Link>
                    <Link href="/clinic/dashboard" className="block px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-sky-600">
                      Clinic Admin Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demo Quick Access</p>
              <div className="flex gap-2">
                <Link href="/admin/dashboard" className="flex-1">
                  <Button variant="dark" size="sm" className="w-full py-4 rounded-xl text-xs">Admin</Button>
                </Link>
                <Link href="/clinic/dashboard" className="flex-1">
                  <Button variant="dark" size="sm" className="w-full py-4 rounded-xl text-xs bg-sky-600 hover:bg-sky-700">Clinic</Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account? <Link href="/register" className="text-brand-blue font-bold hover:underline">Start Free Trial</Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={16} /> Secure
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <CheckCircle2 size={16} /> Verified
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
