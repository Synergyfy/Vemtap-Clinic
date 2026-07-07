"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Smartphone, CheckCircle2,
  Users, User, ChevronDown, LayoutDashboard,
  Building2, UserCircle, Clock, Stethoscope, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dashboardLinks = [
    { name: "Super Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-slate-900", desc: "Global network oversight" },
    { name: "Clinic Admin Dashboard", href: "/clinic/dashboard", icon: Building2, color: "text-sky-600", desc: "Branch & clinical operations" },
    { name: "Doctor Clinical Hub", href: "/doctor/dashboard", icon: Stethoscope, color: "text-emerald-600", desc: "Patient care & consultations" },
    { name: "Nurse Station", href: "/nurse/dashboard", icon: Heart, color: "text-cyan-600", desc: "Vitals, monitoring & patient care" },
    { name: "Receptionist Frontdesk", href: "/reception/dashboard", icon: Clock, color: "text-amber-600", desc: "Registration & queue flow" },
    { name: "Patient Success Portal", href: "/patient/dashboard", icon: UserCircle, color: "text-emerald-600", desc: "Results, orders & bookings" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-10 md:p-12 border border-slate-100 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-blue">
                  <ShieldCheck size={28} />
                </div>
                <h1 className="text-2xl font-black text-brand-navy mb-2 leading-tight text-nowrap">Secure Login</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Access the Vemtap Health ecosystem</p>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      placeholder="name@clinic.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Security Key</label>
                    <Link href="/forgot-password" main-shaking-text="true" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">
                      Recovery?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" className="w-full py-7 text-base font-black rounded-2xl shadow-xl shadow-brand-blue/20">
                  Authenticate
                </Button>

                {/* Unified Mock Quick Access */}
                <div className="relative pt-4 border-t border-slate-50">
                   <button 
                     type="button"
                     onClick={() => setIsQuickAccessOpen(!isQuickAccessOpen)}
                     className="w-full py-4 px-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between group hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                            <ArrowRight size={14} className="text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest">Quick Dashboard Access</span>
                      </div>
                      <ChevronDown size={16} className={cn("transition-transform text-white/40", isQuickAccessOpen && "rotate-180")} />
                   </button>

                   <AnimatePresence>
                      {isQuickAccessOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 z-50 overflow-hidden"
                        >
                           <div className="p-3 mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Environment</p>
                           </div>
                           {dashboardLinks.map((link) => (
                             <Link 
                               key={link.name} 
                               href={link.href}
                               className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
                             >
                                <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-sm", link.color)}>
                                   <link.icon size={20} />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900">{link.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{link.desc}</p>
                                </div>
                             </Link>
                           ))}
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Smartphone size={14} /> iOS & Android
             </div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} /> NDPR Secure
             </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
