"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
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
    <main className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-4 font-[Inter,sans-serif]">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0055c4] flex items-center justify-center shadow-sm text-white">
            <span className="material-symbols-outlined text-[24px]">visibility</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold tracking-tight text-[#131b2e] leading-tight">
              VEMTAP
            </span>
            <span className="text-[9px] font-bold tracking-[0.16em] text-[#0055c4] uppercase leading-tight">
              EYE CLINIC
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#c2c6d7]/40 bg-white p-7 shadow-sm">
          <div>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#131b2e] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-[13px] text-[#424655] mt-1">
                Sign in to view your records, appointments &amp; prescriptions
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#131b2e]">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727786]" size={18} />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f2f3ff] border border-transparent text-[#131b2e] text-[14px] font-medium outline-none focus:border-[#0055c4] focus:bg-white transition-all placeholder:text-[#727786]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#131b2e]">
                    Password
                  </label>
                  <Link href="/patient/welcome" className="text-[11px] font-semibold text-[#0055c4] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727786]" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#f2f3ff] border border-transparent text-[#131b2e] text-[14px] font-medium outline-none focus:border-[#0055c4] focus:bg-white transition-all placeholder:text-[#727786]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727786] hover:text-[#131b2e] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-5 py-3 rounded-xl bg-[#0055c4] hover:bg-[#1759c4] active:scale-[0.99] text-white font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

            <div className="mt-6 pt-5 border-t border-[#e2e7ff] space-y-2 text-center">
              <p className="text-[13px] text-[#424655]">
                New patient?{" "}
                <Link
                  href="/patient/register"
                  className="font-bold text-[#0055c4] hover:underline"
                >
                  Create an account
                </Link>
              </p>
              <p className="text-[12px] text-[#727786]">
                Clinic staff?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#131b2e] hover:text-[#0055c4]"
                >
                  Staff Portal &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
