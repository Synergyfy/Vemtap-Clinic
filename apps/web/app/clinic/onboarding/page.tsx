"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, MapPin, ShieldCheck, Sparkles, Users, Wallet, QrCode } from "lucide-react";

const ONBOARDING_STORAGE_KEY = "vemtap-clinic-onboarding";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type OnboardingFormState = {
  clinicName: string;
  clinicType: string;
  address: string;
  city: string;
  registrationNumber: string;
  logoUrl: string;
  branchName: string;
  branchAddress: string;
  branchManager: string;
  plan: string;
  services: string;
  operatingHours: string;
  departments: string;
  inviteStaff: string;
  hmoSetup: string;
  qrFocus: string;
};

const defaultFormState: OnboardingFormState = {
  clinicName: "",
  clinicType: "Eye Clinic",
  address: "",
  city: "",
  registrationNumber: "",
  logoUrl: "",
  branchName: "",
  branchAddress: "",
  branchManager: "",
  plan: "Growth",
  services: "Consultation, Optometry, Diagnostics, Pharmacy",
  operatingHours: "Mon-Sat: 8:00 AM - 6:00 PM",
  departments: "Front Desk, Optometry, Clinical, Pharmacy, Admin",
  inviteStaff: "",
  hmoSetup: "",
  qrFocus: "Patient check-in",
};

const steps: OnboardingStep[] = [
  { id: "account", title: "Create account", description: "Owner details and login setup", completed: true },
  { id: "verify", title: "Verify contact details", description: "Email and phone validation", completed: false },
  { id: "clinic", title: "Register clinic", description: "Clinic name, type and legal details", completed: false },
  { id: "branch", title: "Primary branch", description: "Main branch setup", completed: false },
  { id: "plan", title: "Select subscription", description: "Starter, Growth, Enterprise", completed: false },
  { id: "profile", title: "Complete clinic profile", description: "Services, hours and departments", completed: false },
  { id: "staff", title: "Invite staff", description: "Doctors, nurses and support teams", completed: false },
  { id: "operations", title: "Configure operations", description: "Pricing, HMOs and workflows", completed: false },
  { id: "verification", title: "Verification and activation", description: "Review and activate clinic", completed: false },
  { id: "qr", title: "Generate QR codes", description: "Patient check-in entry points", completed: false },
  { id: "dashboard", title: "Enter clinic dashboard", description: "Ready for patient onboarding", completed: false },
];

const stepTitles = steps.map((step) => step.title);

export default function ClinicOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [form, setForm] = useState<OnboardingFormState>(defaultFormState);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { step?: number; form?: OnboardingFormState; completed?: boolean };
        if (parsed?.completed === true) {
          router.replace("/clinic/dashboard");
          return;
        }

        if (parsed?.form) {
          setForm({ ...defaultFormState, ...parsed.form });
        }
        if (typeof parsed?.step === "number") {
          setCurrentStepIndex(Math.min(Math.max(parsed.step, 2), steps.length - 1));
        }
      } catch {
        // ignore invalid local cache
      }
    } else {
      setForm((prev) => ({ ...prev, clinicName: user.clinicName || prev.clinicName }));
    }
  }, [router, user]);

  const currentStep = steps[currentStepIndex];

  const completionPercent = useMemo(() => {
    const completed = steps.filter((step) => step.completed).length;
    return Math.round((completed / steps.length) * 100);
  }, []);

  const updateField = (field: keyof OnboardingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const saveProgress = () => {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        step: currentStepIndex,
        form,
        completed: false,
      }),
    );
    setIsSaved(true);
  };

  const canContinue = () => {
    if (currentStepIndex === 2) return !!form.clinicName.trim() && !!form.clinicType.trim();
    if (currentStepIndex === 3) return !!form.branchName.trim() && !!form.branchAddress.trim();
    if (currentStepIndex === 4) return !!form.plan.trim();
    if (currentStepIndex === 5) return !!form.services.trim() && !!form.operatingHours.trim();
    if (currentStepIndex === 6) return !!form.inviteStaff.trim();
    if (currentStepIndex === 7) return !!form.hmoSetup.trim() || !!form.services.trim();
    if (currentStepIndex === 8) return true;
    if (currentStepIndex === 9) return !!form.qrFocus.trim();
    return true;
  };

  const goNext = () => {
    saveProgress();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({
          step: steps.length - 1,
          form,
          completed: true,
        }),
      );
      router.push("/clinic/dashboard");
    }
  };

  const goBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 2));
  };

  const renderForm = () => {
    switch (currentStep.id) {
      case "clinic":
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Clinic name</label>
              <input value={form.clinicName} onChange={(e) => updateField("clinicName", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Flourish iClinic" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Clinic type</label>
              <select value={form.clinicType} onChange={(e) => updateField("clinicType", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <option>Eye Clinic</option>
                <option>Optical Center</option>
                <option>Multi-specialty Clinic</option>
                <option>Vision Care Center</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Address</label>
              <textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="12 Lekki Phase 1 Road" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">City</label>
                <input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Lagos" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Registration no.</label>
                <input value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="RC-12345" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Clinic logo URL</label>
              <input value={form.logoUrl} onChange={(e) => updateField("logoUrl", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="https://..." />
            </div>
          </div>
        );
      case "branch":
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Branch name</label>
              <input value={form.branchName} onChange={(e) => updateField("branchName", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Branch A - Main branch" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Branch address</label>
              <textarea value={form.branchAddress} onChange={(e) => updateField("branchAddress", e.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="45 Marina Road" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Branch manager</label>
              <input value={form.branchManager} onChange={(e) => updateField("branchManager", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Jane Smith" />
            </div>
          </div>
        );
      case "plan":
        return (
          <div className="space-y-4">
            {[
              "Starter",
              "Growth",
              "Enterprise",
            ].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateField("plan", option)}
                className={`w-full rounded-2xl border p-4 text-left transition ${form.plan === option ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-800">{option}</span>
                  {form.plan === option ? <CheckCircle2 className="text-sky-600" size={18} /> : null}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {option === "Starter" && "For small clinics and focused care teams"}
                  {option === "Growth" && "For scaling multi-service clinics and workflows"}
                  {option === "Enterprise" && "For multi-branch organizations and complex operations"}
                </p>
              </button>
            ))}
          </div>
        );
      case "profile":
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Services</label>
              <textarea value={form.services} onChange={(e) => updateField("services", e.target.value)} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Operating hours</label>
              <input value={form.operatingHours} onChange={(e) => updateField("operatingHours", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Departments</label>
              <input value={form.departments} onChange={(e) => updateField("departments", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
          </div>
        );
      case "staff":
        return (
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Invite staff</label>
            <textarea value={form.inviteStaff} onChange={(e) => updateField("inviteStaff", e.target.value)} className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="doctor@clinic.com, nurse@clinic.com, reception@clinic.com" />
          </div>
        );
      case "operations":
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">HMO & operations setup</label>
              <textarea value={form.hmoSetup} onChange={(e) => updateField("hmoSetup", e.target.value)} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="List HMOs, pricing and service rules" />
            </div>
          </div>
        );
      case "qr":
        return (
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">QR entry point</label>
            <input value={form.qrFocus} onChange={(e) => updateField("qrFocus", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Patient check-in" />
          </div>
        );
      case "dashboard":
        return (
          <div className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 size={22} />
              <h3 className="text-xl font-bold">Clinic is ready for onboarding</h3>
            </div>
            <p className="text-sm text-slate-600">
              Your clinic {form.clinicName || "organization"} has been created and is ready for operational setup and patient onboarding.
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-4 rounded-3xl border border-sky-200 bg-sky-50 p-6">
            <div className="flex items-center gap-3 text-sky-700">
              <ShieldCheck size={20} />
              <h3 className="text-xl font-bold">Verify contact details</h3>
            </div>
            <p className="text-sm text-slate-600">Send OTP to the owner email and/or phone before moving to clinic setup.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</div>
                <div className="mt-2 text-sm font-medium text-slate-700">{user?.email || "owner@clinic.com"}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone</div>
                <div className="mt-2 text-sm font-medium text-slate-700">{user?.phone || "0801 234 5678"}</div>
              </div>
            </div>
          </div>
        );
    }
  };

  const stepBadgeIcon =
    currentStepIndex === 2 ? <Building2 size={18} /> :
    currentStepIndex === 3 ? <MapPin size={18} /> :
    currentStepIndex === 4 ? <Wallet size={18} /> :
    currentStepIndex === 6 ? <Users size={18} /> :
    currentStepIndex === 9 ? <QrCode size={18} /> :
    <Sparkles size={18} />;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Clinic onboarding</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Set up {form.clinicName || "your clinic"}</h1>
          </div>
          <Button variant="outline" onClick={saveProgress}>Save draft</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-500">Onboarding progress</div>
              <div className="text-sm font-bold text-sky-600">{completionPercent}%</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-600" style={{ width: `${completionPercent}%` }} />
            </div>

            <div className="mt-6 space-y-3">
              {stepTitles.map((label, index) => {
                const active = index === currentStepIndex;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition ${active ? "border-sky-200 bg-sky-50" : "border-transparent bg-slate-50 hover:bg-slate-100"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index <= currentStepIndex ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {index + 1}
                      </span>
                      <span className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
                    </span>
                    {index <= currentStepIndex ? <CheckCircle2 size={16} className="text-emerald-500" /> : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">{stepBadgeIcon}</div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Step {currentStepIndex + 1}</div>
                <div className="text-xl font-black text-slate-900">{currentStep.title}</div>
                <div className="text-sm text-slate-500">{currentStep.description}</div>
              </div>
            </div>

            {isSaved ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Draft saved successfully.</div> : null}

            {renderForm()}

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <Button type="button" variant="outline" onClick={goBack} disabled={currentStepIndex <= 2} className="gap-2">
                <ChevronLeft size={16} /> Back
              </Button>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={saveProgress}>Save draft</Button>
                <Button type="button" className="gap-2" onClick={goNext} disabled={!canContinue()}>
                  {currentStepIndex === steps.length - 1 ? "Finish onboarding" : "Continue"}
                  {currentStepIndex < steps.length - 1 ? <ChevronRight size={16} /> : null}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
