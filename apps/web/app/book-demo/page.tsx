"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Eye, Glasses, Stethoscope, Microscope, 
  ChevronRight, ChevronLeft, Calendar as CalendarIcon, 
  Clock, CheckCircle2, ShieldCheck, Users, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = ["Clinic Type", "Clinic Details", "Schedule", "Contact"];

export default function BookDemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    clinicType: "",
    clinicName: "",
    branchCount: "1",
    preferredDate: "",
    preferredTime: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
              <h2 className="text-3xl font-bold text-brand-navy mb-4">What type of clinic do you run?</h2>
              <p className="text-slate-500">Select the option that best describes your practice.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "eye-clinic", title: "Eye Clinic", icon: Building2 },
                { id: "optical", title: "Optical Center", icon: Glasses },
                { id: "vision", title: "Vision Center", icon: Eye },
                { id: "ophthalmology", title: "Ophthalmology Hospital", icon: Stethoscope },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    updateForm("clinicType", type.id);
                    nextStep();
                  }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all ${formData.clinicType === type.id ? "border-brand-blue bg-brand-soft-blue shadow-lg" : "border-slate-100 hover:border-brand-blue/30"}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${formData.clinicType === type.id ? "bg-brand-blue text-white" : "bg-slate-50 text-slate-400"}`}>
                    <type.icon size={24} />
                  </div>
                  <div className="font-bold text-brand-navy">{type.title}</div>
                </button>
              ))}
            </div>
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
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Tell us about your clinic</h2>
              <p className="text-slate-500">This helps us tailor the demo to your operations.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Clinic Name</label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => updateForm("clinicName", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Enter your clinic name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Number of Branches</label>
                <select
                  value={formData.branchCount}
                  onChange={(e) => updateForm("branchCount", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                >
                  <option value="1">Single Branch</option>
                  <option value="2-5">2 - 5 Branches</option>
                  <option value="6-10">6 - 10 Branches</option>
                  <option value="11+">11+ Branches</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="outline" className="flex-1" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1" onClick={nextStep} disabled={!formData.clinicName}>Continue</Button>
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
              <h2 className="text-3xl font-bold text-brand-navy mb-4">When should we talk?</h2>
              <p className="text-slate-500">Pick a preferred date and time for your session.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Preferred Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => updateForm("preferredDate", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Preferred Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => updateForm("preferredTime", e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  >
                    <option value="">Select a time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 6 PM)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="outline" className="flex-1" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1" onClick={nextStep} disabled={!formData.preferredDate || !formData.preferredTime}>Continue</Button>
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
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Final Details</h2>
              <p className="text-slate-500">Where should we send the calendar invite?</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Doe"
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
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="+234 ..."
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="outline" className="flex-1" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1" onClick={() => setCurrentStep(4)}>Confirm Demo</Button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold text-brand-navy mb-4">You're all set!</h2>
            <p className="text-xl text-slate-500 mb-8 max-w-md mx-auto">
              We've received your request for a demo of Vemtap Health. A calendar invite has been sent to <span className="font-bold text-brand-blue">{formData.email}</span>.
            </p>
            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 inline-block text-left mb-10">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Demo Summary</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-bold text-brand-navy">
                  <CalendarIcon size={18} className="text-brand-blue" /> {formData.preferredDate}
                </div>
                <div className="flex items-center gap-3 font-bold text-brand-navy">
                  <Clock size={18} className="text-brand-blue" /> {formData.preferredTime.charAt(0).toUpperCase() + formData.preferredTime.slice(1)} Session
                </div>
                <div className="flex items-center gap-3 font-bold text-brand-navy">
                  <Building2 size={18} className="text-brand-blue" /> {formData.clinicName}
                </div>
              </div>
            </div>
            <br />
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Sidebar */}
              <div className="bg-brand-navy p-10 text-white lg:col-span-1">
                <div className="mb-12">
                  <h3 className="text-xl font-bold mb-2">Book a Demo</h3>
                  <p className="text-sm text-slate-400">See the future of eye clinic management.</p>
                </div>
                <div className="space-y-8 relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10"></div>
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${currentStep >= i ? "bg-brand-blue border-brand-blue text-white" : "bg-brand-navy border-white/20 text-white/40"}`}>
                        {currentStep > i ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      <div className={`text-sm font-bold ${currentStep >= i ? "text-white" : "text-white/40"}`}>{step}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-20 pt-10 border-t border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <ShieldCheck size={20} className="text-brand-blue" />
                    </div>
                    <div className="text-xs text-slate-400">Trusted by 500+ clinics worldwide</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Users size={20} className="text-brand-blue" />
                    </div>
                    <div className="text-xs text-slate-400">24/7 Expert Support</div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-10 md:p-16 lg:col-span-2">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
