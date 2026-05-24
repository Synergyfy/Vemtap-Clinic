"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, Building2, MapPin, Mail, 
  Phone, User, ShieldCheck, ChevronRight,
  ArrowLeft, Upload, Globe, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, title: "Clinic Details", icon: Building2 },
  { id: 2, title: "Subscription", icon: CreditCard },
  { id: 3, title: "Admin Setup", icon: User },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        {!isSuccess && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 flex">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "flex-1 transition-all duration-500",
                  currentStep >= step.id ? "bg-brand-blue" : "bg-transparent"
                )}
              />
            ))}
          </div>
        )}

        <div className="p-8 md:p-12">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-brand-navy tracking-tight">Onboard New Clinic</h2>
                  <p className="text-slate-500 text-sm mt-1">Step {currentStep} of {steps.length}: {steps[currentStep-1].title}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Steps Content */}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Clinic Name</label>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input type="text" placeholder="e.g. Vision Plus" className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input type="email" placeholder="contact@clinic.com" className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Physical Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Full street address" className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Country</label>
                            <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-sm font-medium">
                              <option>Nigeria</option>
                              <option>Ghana</option>
                              <option>Kenya</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input type="tel" placeholder="+234..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <p className="text-sm text-slate-500 mb-6">Select the appropriate platform tier for this clinic.</p>
                        <div className="grid grid-cols-1 gap-4">
                          {[
                            { id: 'starter', name: 'Starter', price: '$49/mo', desc: 'Single branch, up to 5 staff members.' },
                            { id: 'growth', name: 'Growth', price: '$149/mo', desc: 'Up to 3 branches, unlimited staff.' },
                            { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Unlimited branches, API access, & support.' },
                          ].map((plan) => (
                            <label key={plan.id} className="relative flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-brand-blue/30 cursor-pointer transition-all group has-[:checked]:border-brand-blue has-[:checked]:bg-brand-soft-blue/30">
                              <input type="radio" name="plan" className="hidden peer" defaultChecked={plan.id === 'growth'} />
                              <div>
                                <h4 className="font-bold text-brand-navy">{plan.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{plan.desc}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-brand-navy">{plan.price}</p>
                                <div className="w-5 h-5 rounded-full border-2 border-slate-200 mt-2 flex items-center justify-center peer-checked:border-brand-blue peer-checked:bg-brand-blue transition-all">
                                  <Check size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                          <ShieldCheck className="text-amber-500 shrink-0" size={24} />
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Initial admin credentials will be sent to the owner's email. They will be required to change their password upon first login.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Clinic Owner Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input type="text" placeholder="Dr. Full Name" className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Admin Username</label>
                            <input type="text" placeholder="e.g. admin_visionplus" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={cn("gap-2 font-bold", currentStep === 1 && "opacity-0")}
                >
                  <ArrowLeft size={16} /> Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="gap-2 px-8 shadow-lg shadow-brand-blue/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        {currentStep === steps.length ? "Confirm Onboarding" : "Continue"} 
                        {currentStep !== steps.length && <ChevronRight size={16} />}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200"
              >
                <Check size={48} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-brand-navy mb-4">Clinic Onboarded!</h2>
              <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed">
                Vision Plus Eye Clinic has been successfully registered. The owner has been notified via email with their login credentials.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="primary" className="w-full py-6 rounded-2xl text-lg font-bold" onClick={onClose}>
                  Go to Clinics List
                </Button>
                <Button variant="ghost" className="font-bold text-brand-blue" onClick={() => { setIsSuccess(false); setCurrentStep(1); }}>
                  Onboard Another Clinic
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
