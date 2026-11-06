"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getClinicEntryRoute, getDashboardRoute } from "@/lib/dashboard-routes";

type IconProps = {
  size?: number;
  className?: string;
};

const ShieldCheckIcon = ShieldCheck as React.ComponentType<IconProps>;
const AlertCircleIcon = AlertCircle as React.ComponentType<IconProps>;
const MailIcon = Mail as React.ComponentType<IconProps>;
const LockIcon = Lock as React.ComponentType<IconProps>;
const EyeIcon = Eye as React.ComponentType<IconProps>;
const EyeOffIcon = EyeOff as React.ComponentType<IconProps>;
const LoaderIcon = Loader2 as React.ComponentType<IconProps>;
const SmartphoneIcon = Smartphone as React.ComponentType<IconProps>;

const dashboardOptions = [
  { label: "Super Admin Dashboard", value: "/admin/dashboard" },
  { label: "Clinic Admin Dashboard", value: "/clinic/dashboard" },
  { label: "Doctor Dashboard", value: "/doctor/dashboard" },
  { label: "Nurse Dashboard", value: "/nurse/dashboard" },
  { label: "Reception Dashboard", value: "/reception/dashboard" },
  { label: "Pharmacy Dashboard", value: "/pharmacy/dashboard" },
  { label: "Optician Dashboard", value: "/optician/dashboard" },
  { label: "Patient Dashboard", value: "/patient/dashboard" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(dashboardOptions[0].value);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    router.replace(getClinicEntryRoute(user));
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(formData.email, formData.password);
      router.push(getClinicEntryRoute(authenticatedUser ?? user));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center px-3 pb-10 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="w-full max-w-[420px] sm:max-w-lg">
          
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/60 sm:rounded-[3rem] sm:p-10 md:p-12">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-blue">
                  <ShieldCheckIcon size={28} />
                </div>
                <h1 className="text-2xl font-black text-brand-navy mb-2 leading-tight text-nowrap">Secure Login</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Access the Vemtap Health ecosystem</p>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm" role="alert">
                  <AlertCircleIcon size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Account Email</label>
                  <div className="relative">
                    <MailIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-base font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/50 sm:pl-14 sm:pr-6"
                      placeholder="name@clinic.com"
                      disabled={isSubmitting}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Security Key</label>
                    <Link href="/forgot-password" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">
                      Recovery?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-11 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-base font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/50 sm:pl-14 sm:pr-14"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  variant="default" 
                  className="w-full py-7 text-base font-black rounded-2xl shadow-xl shadow-brand-blue/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderIcon size={20} className="animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    "Authenticate"
                  )}
                </Button>

                <div className="space-y-3 pt-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dashboard Access</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedDashboard}
                      onChange={(e) => setSelectedDashboard(e.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none ring-0 transition-all focus:border-brand-blue/50 focus:bg-white"
                    >
                      {dashboardOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 px-4 py-3 text-sm font-bold rounded-2xl border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5"
                      onClick={() => router.push(selectedDashboard)}
                    >
                      Open
                    </Button>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-brand-blue font-bold hover:underline">
                    Create one
                  </Link>
                </p>
                <p className="text-center text-xs text-slate-500">
                  Are you a patient?{' '}
                  <Link href="/patient/login" className="text-teal-600 font-bold hover:underline">
                    Patient Portal Login &rarr;
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <SmartphoneIcon size={14} /> iOS & Android
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheckIcon size={14} /> NDPR Secure
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}