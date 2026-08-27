"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  Mail, ArrowLeft, 
  Send, CheckCircle2, ShieldCheck, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "sent" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { Eye, EyeOff } = require("lucide-react");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const emailParam = params.get("email");
    if (token) {
      setResetToken(token);
      setStep("reset");
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, newPassword: "", token: "" });
      setStep("sent");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!resetToken) {
      setError("Reset token is required");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, newPassword, token: resetToken });
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-32 pb-20">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 text-center">
            {/* Step 1: Email Form */}
            {step === "email" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="w-16 h-16 bg-brand-soft-blue text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold text-brand-navy mb-4">Reset Password</h1>
                <p className="text-slate-500 text-sm mb-10">Enter your work email and we'll send you a link to reset your password.</p>

                <form className="space-y-6 text-left" onSubmit={handleRequestReset}>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm" role="alert">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
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
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full py-5 text-lg font-bold rounded-2xl group"
                    disabled={!email || isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Reset Link <Send size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Link Sent */}
            {step === "sent" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
                  onClick={() => setStep("email")}
                >
                  Resend Link
                </Button>
              </motion.div>
            )}

            {/* Step 3: Reset Password Form */}
            {step === "reset" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="w-16 h-16 bg-brand-soft-blue text-brand-blue rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-bold text-brand-navy mb-4">Set New Password</h2>
                <p className="text-slate-500 text-sm mb-10">
                  Enter your new password below.
                </p>

                <form className="space-y-6 text-left" onSubmit={handleResetPassword}>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm" role="alert">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm" role="alert">
                      <CheckCircle2 size={16} />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full py-5 text-lg font-bold rounded-2xl"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
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