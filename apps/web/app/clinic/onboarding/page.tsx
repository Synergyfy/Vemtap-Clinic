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
  clinicType: "",
  address: "",
  city: "",
  registrationNumber: "",
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
  { id: "welcome", title: "Welcome to Vemtap Clinic", description: "A quick overview of how the clinic will work", completed: false },
  { id: "complete", title: "Ready to begin", description: "Create your branch, add patients and launch operations", completed: false },
];

const stepTitles = steps.map((step) => step.title);

export default function ClinicOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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
          setCurrentStepIndex(Math.min(Math.max(parsed.step, 0), steps.length - 1));
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

  const canContinue = () => true;

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
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderForm = () => {
    switch (currentStep.id) {
      case "welcome":
        return (
          <div className="space-y-5 rounded-3xl border border-sky-200 bg-sky-50 p-6">
            <div className="flex items-center gap-3 text-sky-700">
              <Sparkles size={22} />
              <h3 className="text-xl font-bold">Welcome to Vemtap Clinic</h3>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Vemtap helps clinics manage patients, branches, appointments, medical records, billing, and operations from one place.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm font-black text-slate-900">Create branches</div>
                <p className="text-sm text-slate-600">Set up each clinic location and manage the teams working there.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm font-black text-slate-900">Add patients</div>
                <p className="text-sm text-slate-600">Register patients, track visits and handle their care journey.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm font-black text-slate-900">Run operations</div>
                <p className="text-sm text-slate-600">Manage bookings, payments, staff, and clinical workflows without the chaos.</p>
              </div>
            </div>
          </div>
        );
      case "complete":
        return (
          <div className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 size={22} />
              <h3 className="text-xl font-bold">You are ready to begin</h3>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Once you complete this onboarding, you can create your clinic branch, add patients, invite staff, and begin using Vemtap to run your clinic operations.
            </p>
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
              This is just a short intro. You can always create branches, add patients, and configure more details later from the clinic dashboard.
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4 rounded-3xl border border-sky-200 bg-sky-50 p-6">
            <div className="flex items-center gap-3 text-sky-700">
              <ShieldCheck size={20} />
              <h3 className="text-xl font-bold">Welcome to Vemtap Clinic</h3>
            </div>
            <p className="text-sm text-slate-600">Create branches, add patients, and manage your clinic from one dashboard.</p>
          </div>
        );
    }
  };

  const stepBadgeIcon = currentStepIndex === 0 ? <Sparkles size={18} /> : <CheckCircle2 size={18} />;

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
              <Button type="button" variant="outline" onClick={goBack} disabled={currentStepIndex === 0} className="gap-2">
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
