"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, MapPin, CreditCard, 
  CheckCircle2, ArrowRight, ArrowLeft, 
  ShieldCheck, Globe, Zap, Users, QrCode,
  Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = ["Account", "Clinic Info", "Branch Setup", "Plan"];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Account
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    // Clinic Info
    clinicName: "",
    clinicType: "eye-clinic",
    country: "Nigeria",
    // Branch
    branchName: "Main Branch",
    address: "",
    phone: "",
    // Plan
    selectedPlan: "growth",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-navy mb-2">Create Your Account</h2>
              <p className="text-slate-500 text-sm">Start your 14-day free trial. No credit card required.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="john@clinic.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm("confirmPassword", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <Button 
              variant="primary" 
              className="w-full py-5 text-lg font-bold rounded-2xl mt-4" 
              onClick={nextStep} 
              disabled={!formData.email || !formData.password || formData.password !== formData.confirmPassword}
            >
              Continue to Clinic Setup
            </Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-brand-blue font-bold">Login</Link>
            </p>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-navy mb-2">Clinic Information</h2>
              <p className="text-slate-500 text-sm">Tell us about your healthcare facility.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Clinic Name</label>
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => updateForm("clinicName", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Vision Eye Clinic"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Clinic Type</label>
                <select
                  value={formData.clinicType}
                  onChange={(e) => updateForm("clinicType", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                >
                  <option value="eye-clinic">General Eye Clinic</option>
                  <option value="optical">Optical Center</option>
                  <option value="ophthalmology">Ophthalmology Hospital</option>
                  <option value="specialist">Specialist Center</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Country</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Nigeria"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-4 rounded-2xl" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1 py-4 rounded-2xl font-bold" onClick={nextStep} disabled={!formData.clinicName}>Continue</Button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-navy mb-2">First Branch Setup</h2>
              <p className="text-slate-500 text-sm">Enter the details for your main location.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Branch Name</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => updateForm("branchName", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Main Branch"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="123 Health Ave, Lagos"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Branch Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="+234 ..."
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-4 rounded-2xl" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1 py-4 rounded-2xl font-bold" onClick={nextStep} disabled={!formData.address || !formData.phone}>Continue</Button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-navy mb-2">Choose Your Plan</h2>
              <p className="text-slate-500 text-sm">Select a plan to complete your registration.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { id: "starter", title: "Starter", price: "$120/mo", desc: "Single branch focus." },
                { id: "growth", title: "Growth", price: "$240/mo", desc: "Advanced workflows & OCR." },
                { id: "enterprise", title: "Enterprise", price: "Custom", desc: "Custom chains & groups." },
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => updateForm("selectedPlan", plan.id)}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.selectedPlan === plan.id ? "border-brand-blue bg-brand-soft-blue shadow-md" : "border-slate-100 hover:border-brand-blue/30"}`}
                >
                  <div className="text-left">
                    <div className="font-bold text-brand-navy">{plan.title}</div>
                    <div className="text-xs text-slate-500">{plan.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-blue">{plan.price}</div>
                    {formData.selectedPlan === plan.id && <CheckCircle2 className="text-brand-blue inline-block ml-2" size={16} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-4 rounded-2xl" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1 py-4 rounded-2xl font-bold" onClick={() => setCurrentStep(4)}>Complete Setup</Button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold text-brand-navy mb-4">Registration Complete!</h2>
            <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
              Welcome to Vemtap Health, <span className="font-bold text-brand-blue">{formData.fullName}</span>! Your clinic dashboard is ready.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Branch Status</div>
                <div className="flex items-center gap-2 font-bold text-brand-navy text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> {formData.branchName} Active
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">QR Generated</div>
                <div className="flex items-center gap-2 font-bold text-brand-navy text-sm">
                  <QrCode size={16} className="text-brand-blue" /> Check-in Ready
                </div>
              </div>
            </div>

            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full py-5 rounded-2xl font-black text-xl gap-3 shadow-2xl shadow-brand-blue/30">
                Enter My Dashboard <ArrowRight size={24} />
              </Button>
            </Link>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-400 mb-4">What's next?</p>
              <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Users size={18} /></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Invite Staff</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><ShieldCheck size={18} /></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Verify HMOs</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><CreditCard size={18} /></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Billing Setup</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-5xl w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar / Progress */}
            <div className="bg-brand-navy p-10 text-white md:w-1/3 flex flex-col">
              <div className="mb-12">
                <Link href="/" className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                  </div>
                  <span className="text-xl font-bold">Vemtap</span>
                </Link>
                <h3 className="text-xl font-bold mb-2">Clinic Onboarding</h3>
                <p className="text-sm text-slate-400">Join the future of eye care.</p>
              </div>

              <div className="space-y-8 flex-grow">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${currentStep >= i ? "bg-brand-blue border-brand-blue text-white" : "bg-brand-navy border-white/20 text-white/40"}`}>
                      {currentStep > i ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <div className={`text-sm font-bold ${currentStep >= i ? "text-white" : "text-white/40"}`}>{step}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-white/10 hidden md:block">
                <div className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-widest">Why choose us?</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-brand-blue" />
                    <span className="text-xs text-slate-300">Bank-grade security</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-brand-blue" />
                    <span className="text-xs text-slate-300">Instant branch sync</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="p-10 md:p-16 md:w-2/3">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
