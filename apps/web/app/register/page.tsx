"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getClinicEntryRoute, getDashboardRoute } from "@/lib/dashboard-routes";

const steps = ["Account"];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    clinicName: "",
    clinicPhone: "",
    clinicCity: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const passwordMismatch =
    !!formData.password &&
    !!formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getClinicEntryRoute(user));
    }
  }, [isAuthenticated, user, router]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const getErrorMessage = (err: any) => {
    const responseMessage = err?.response?.data?.message;
    if (Array.isArray(responseMessage)) {
      return responseMessage.join(" ");
    }
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
    if (typeof err?.response?.data?.error === "string" && err.response.data.error.trim()) {
      return err.response.data.error;
    }
    if (typeof err?.message === "string" && err.message.trim()) {
      return err.message;
    }
    return "Registration failed. Please check your information and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const registeredUser = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        clinicName: formData.clinicName,
        clinicPhone: formData.clinicPhone,
        clinicCity: formData.clinicCity,
      });
      router.push(getClinicEntryRoute(registeredUser ?? user));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="text-slate-500 text-sm">Join the Vemtap Health ecosystem.</p>
            </div>
            <div className="space-y-4">
              {error && (
                <div
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateForm("firstName", e.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="John"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateForm("lastName", e.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="Doe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
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
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Clinic Name</label>
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => updateForm("clinicName", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Apex Vision Clinic"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Clinic Phone</label>
                  <input
                    type="tel"
                    value={formData.clinicPhone}
                    onChange={(e) => updateForm("clinicPhone", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="08012345678"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Clinic City</label>
                  <input
                    type="text"
                    value={formData.clinicCity}
                    onChange={(e) => updateForm("clinicCity", e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Lagos"
                    disabled={isSubmitting}
                  />
                </div>
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
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                    disabled={isSubmitting}
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
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="flex items-center gap-2 text-sm text-red-600" role="alert">
                    <AlertCircle size={16} className="shrink-0" />
                    Passwords do not match.
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="default"
              className="w-full py-5 text-lg font-bold rounded-2xl mt-4"
              onClick={handleSubmit}
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.clinicName || !formData.password || passwordMismatch || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Creating Clinic Account...
                </span>
              ) : (
                "Create Clinic Admin Account"
              )}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-brand-blue font-bold">Login</Link>
            </p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isAuthenticated && user) {
    return null;
  }

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