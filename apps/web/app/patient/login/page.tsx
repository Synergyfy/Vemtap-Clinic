"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePatientLogin } from "@/hooks/usePatientPortal";

export default function PatientLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const loginMutation = usePatientLogin();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    loginMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        onSuccess: () => {
          router.replace("/patient/dashboard");
        },
        onError: (err: any) => {
          setError(
            err?.response?.data?.message ??
            err?.message ??
            "Invalid credentials. Please check your email and password."
          );
        },
      }
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 sm:p-10 shadow-2xl shadow-slate-200/60">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-teal-50 border border-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Patient Portal
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Sign in to view your records, appointments & invoices
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-center">
              <p className="text-xs text-slate-500 font-medium">
                New patient?{" "}
                <Link
                  href="/patient/register"
                  className="font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4"
                >
                  Self-register for portal access
                </Link>
              </p>
              <p className="text-xs text-slate-400">
                Clinic staff?{" "}
                <Link
                  href="/login"
                  className="font-medium text-slate-600 hover:text-slate-800"
                >
                  Staff Login &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
