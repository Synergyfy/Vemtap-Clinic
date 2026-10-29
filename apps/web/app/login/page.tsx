"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Smartphone, CheckCircle2,
  Users, User, ChevronDown, LayoutDashboard,
  Building2, UserCircle, Clock, Stethoscope, Heart, Pill,
  AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

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
const ArrowRightIcon = ArrowRight as React.ComponentType<IconProps>;
const ChevronDownIcon = ChevronDown as React.ComponentType<IconProps>;
const SmartphoneIcon = Smartphone as React.ComponentType<IconProps>;

const dashboardLinks = [
  { name: "Super Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-slate-900", desc: "Global network oversight", roles: ["admin"] },
  { name: "Clinic Admin Dashboard", href: "/clinic/dashboard", icon: Building2, color: "text-sky-600", desc: "Branch & clinical operations", roles: ["admin"] },
  { name: "Doctor Clinical Hub", href: "/doctor/dashboard", icon: Stethoscope, color: "text-emerald-600", desc: "Patient care & consultations", roles: ["doctor"] },
  { name: "Nurse Station", href: "/nurse/dashboard", icon: Heart, color: "text-cyan-600", desc: "Vitals, monitoring & patient care", roles: ["nurse"] },
  { name: "Optical Hub", href: "/optician/dashboard", icon: Eye, color: "text-amber-600", desc: "Lens orders, production & inventory", roles: ["optometrist"] },
  { name: "Pharmacy Station", href: "/pharmacy/dashboard", icon: Pill, color: "text-emerald-600", desc: "Prescriptions, inventory & dispensing", roles: ["pharmacist"] },
  { name: "Receptionist Frontdesk", href: "/reception/dashboard", icon: Clock, color: "text-amber-600", desc: "Registration & queue flow", roles: ["receptionist"] },
  { name: "Patient Success Portal", href: "/patient/dashboard", icon: UserCircle, color: "text-emerald-600", desc: "Results, orders & bookings", roles: ["patient"] },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEnvironment, setPendingEnvironment] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const redirectMap: Record<string, string> = {
    admin: "/admin/dashboard",
    doctor: "/doctor/dashboard",
    nurse: "/nurse/dashboard",
    optometrist: "/optician/dashboard",
    pharmacist: "/pharmacy/dashboard",
    receptionist: "/reception/dashboard",
    cashier: "/cashier",
    patient: "/patient/dashboard",
  };

  const getDashboardRoute = (role?: string) => redirectMap[role ?? ""] ?? "/clinic/dashboard";

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    router.replace(getDashboardRoute(user.roles?.[0]));
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(formData.email, formData.password);
      const role = authenticatedUser?.roles?.[0] ?? user?.roles?.[0] ?? "";
      router.push(getDashboardRoute(role));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAccess = (href: string, label: string) => {
    if (pendingEnvironment) return;

    setPendingEnvironment(label);
    setIsQuickAccessOpen(false);
    setError(null);
    router.push(href);
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

                {/* Unified Quick Access */}
                <div className="relative pt-4 border-t border-slate-50 z-[80]">
                  <button 
                    type="button"
                    onClick={() => setIsQuickAccessOpen(!isQuickAccessOpen)}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between group hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed relative z-10"
                    disabled={isSubmitting || !!pendingEnvironment}
                    aria-expanded={isQuickAccessOpen}
                    aria-controls="quick-access-menu"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                        {pendingEnvironment ? (
                          <LoaderIcon size={14} className="animate-spin text-sky-400" />
                        ) : (
                          <ArrowRightIcon size={14} className="text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">
                        {pendingEnvironment ? `Opening ${pendingEnvironment}...` : "Quick Dashboard Access"}
                      </span>
                    </div>
                    {!pendingEnvironment && <ChevronDownIcon size={16} className={cn("transition-transform text-white/40", isQuickAccessOpen && "rotate-180")} />}
                  </button>

                  <AnimatePresence>
                    {isQuickAccessOpen && (
                      <motion.div 
                        id="quick-access-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.preventDefault()}
                        className="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 z-[70] overflow-y-auto max-h-[28rem] pointer-events-auto"
                      >
                        <div className="p-3 mb-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Environment</p>
                        </div>
                        {dashboardLinks.map((link) => (
                          <button 
                            key={link.name} 
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickAccess(link.href, link.name);
                            }}
                            disabled={!!pendingEnvironment}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group w-full text-left disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-sm", link.color)}>
                              {(() => {
                                const Icon = link.icon as React.ComponentType<IconProps>;
                                return <Icon size={20} />;
                              })()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{link.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{link.desc}</p>
                            </div>
                          </button>
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