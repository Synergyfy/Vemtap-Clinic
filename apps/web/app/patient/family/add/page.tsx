"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { patientPortalService } from "@/services/patient-portal.service";
import { useAuth } from "@/lib/auth-context";
import { getActivePatientProfileId } from "@/lib/api";
import { isFamilyOwner } from "@/lib/patient-family";

const DOB_MONTHS: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

const DOB_DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

const DOB_MONTH_OPTIONS = Object.keys(DOB_MONTHS);

export default function AddDependentPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProfileId(getActivePatientProfileId());
  }, []);

  // Only the family owner, while their own profile is selected, can add
  // members; dependents (or a dependent profile) are sent back.
  const isOwnerProfileActive = !activeProfileId || activeProfileId === user?.userId;
  const canManageFamily = isFamilyOwner(user) && isOwnerProfileActive;

  useEffect(() => {
    if (isHydrated && user && !canManageFamily) {
      router.replace("/patient/select-profile");
    }
  }, [canManageFamily, isHydrated, router, user]);

  const [relationship, setRelationship] = useState<"child" | "spouse" | "parent" | "other">("child");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dobDay, setDobDay] = useState("12");
  const [dobMonth, setDobMonth] = useState("May");
  const [dobYear, setDobYear] = useState("2016");
  const [gender, setGender] = useState<"boy" | "girl">("girl");

  // Symptom chips multi-select
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
    squinting: true,
    tv: true,
    rubbing: false,
    routine: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic age calculation
  const currentYear = new Date().getFullYear();
  const dobYearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => String(currentYear - index));
  const daysInSelectedMonth = new Date(Number(dobYear), Number(DOB_MONTHS[dobMonth] ?? "01"), 0).getDate();
  const dobDayOptions = DOB_DAY_OPTIONS.slice(0, daysInSelectedMonth);
  const calculatedAge = Math.max(0, currentYear - parseInt(dobYear || "2016", 10));
  const ageClassification = calculatedAge <= 12 ? "Pediatric" : calculatedAge <= 18 ? "Adolescent" : "Adult";

  const keepDayValid = (month: string, year: string) => {
    const max = new Date(Number(year), Number(DOB_MONTHS[month] ?? "01"), 0).getDate();
    setDobDay((day) => (Number(day) > max ? String(max).padStart(2, "0") : day));
  };

  const handleMonthChange = (month: string) => {
    setDobMonth(month);
    keepDayValid(month, dobYear);
  };

  const handleYearChange = (year: string) => {
    setDobYear(year);
    keepDayValid(dobMonth, year);
  };

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      showToast("Please enter the dependent's full name.");
      return;
    }

    if (!trimmedEmail) {
      showToast("Please enter the dependent's email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await patientPortalService.addFamilyMember({
        fullName: trimmedName,
        email: trimmedEmail,
        relationship,
        dateOfBirth: `${dobYear}-${DOB_MONTHS[dobMonth] ?? '01'}-${dobDay.padStart(2, "0")}`,
        gender: gender === "boy" ? "male" : "female",
      });

      showToast(`${trimmedName} has been added to your family.`);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/patient/select-profile");
      }, 1200);
    } catch (error: any) {
      setIsSubmitting(false);
      showToast(error?.response?.data?.message || error?.message || "Unable to add this family member right now.");
    }
  };

  if (isHydrated && user && !canManageFamily) {
    return null;
  }

  return (
    <div className="w-full text-[#131b2e] antialiased selection:bg-[#0055c4]/20 font-[Inter,sans-serif]">
      <div className="max-w-2xl mx-auto w-full space-y-5 pb-24 lg:pb-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e7ff]/60 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)]">
          <div className="flex items-center gap-2">
            <button
              aria-label="Back"
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-[#131b2e] hover:bg-[#e2e7ff] transition-colors cursor-pointer"
              onClick={() => router.back()}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-[#131b2e] tracking-tight">
              Add Dependent Profile
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-semibold text-[#0055c4] bg-[#d9e2ff]/60 px-3 py-1 rounded-full">
              Step 1 of 2: Child Details
            </span>
          </div>
        </div>

        {/* Friendly Pediatric Avatar Setup */}
        <section className="bg-gradient-to-b from-[#f2f3ff] to-white border border-[#c2c6d7]/30 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#d9e2ff]/50 flex items-center justify-center text-[#0055c4] border-2 border-white shadow-sm ring-2 ring-[#0055c4]/20">
              <span className="material-symbols-outlined text-[34px]">child_care</span>
            </div>
            <button
              aria-label="Upload photo"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0055c4] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
              onClick={() => showToast("Photo upload feature ready on mobile device")}
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </button>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0055c4]">
              Pediatric Profile
            </span>
            <h2 className="text-base font-bold text-[#131b2e] leading-tight mt-0.5">
              Let&apos;s set up your child&apos;s care
            </h2>
            <p className="text-xs text-[#424655] mt-0.5">
              Separate medical records with shared family benefits and insurance coverage.
            </p>
          </div>
        </section>

        {/* Relationship Selection */}
        <section className="bg-white border border-[#c2c6d7]/30 rounded-2xl p-5 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#424655]">
            Relationship
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: "child", label: "Child", icon: "child_care" },
              { id: "spouse", label: "Spouse", icon: "favorite" },
              { id: "parent", label: "Parent", icon: "elderly" },
              { id: "other", label: "Other", icon: "person" },
            ].map((item) => {
              const isActive = relationship === item.id;
              return (
                <button
                  key={item.id}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-semibold gap-1.5 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#0055c4] text-white shadow-sm"
                      : "bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff]"
                  }`}
                  onClick={() => setRelationship(item.id as any)}
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-[#727786]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Personal Info */}
        <section className="bg-white border border-[#c2c6d7]/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#424655]">
              Basic Details
            </span>
            <span className="text-xs font-semibold text-[#006847] bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span> EMR Synced
            </span>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#131b2e]" htmlFor="child-fullname">
              {relationship === "child" ? "Child's" : "Dependent's"} Full Legal Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#727786] text-[18px]">
                badge
              </span>
              <input
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#f2f3ff] border border-transparent focus:border-[#0055c4] focus:bg-white text-[#131b2e] text-sm transition-all outline-none"
                id="child-fullname"
                placeholder="e.g. Dependent full name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#131b2e]" htmlFor="dependent-email">
              Email for Independent Account Activation
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#727786] text-[18px]">
                mail
              </span>
              <input
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#f2f3ff] border border-transparent focus:border-[#0055c4] focus:bg-white text-[#131b2e] text-sm transition-all outline-none"
                id="dependent-email"
                placeholder="e.g. dependent@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Date of Birth & Age Tag */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#131b2e]">Date of Birth</label>
              <span className="text-xs font-semibold text-[#0055c4] bg-[#d9e2ff]/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {calculatedAge} yrs old • {ageClassification}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="relative">
                <select
                  className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] border border-transparent focus:border-[#0055c4] text-[#131b2e] text-sm font-semibold appearance-none outline-none pr-8 cursor-pointer"
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                >
                  {dobDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-[#727786] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
              <div className="relative">
                <select
                  className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] border border-transparent focus:border-[#0055c4] text-[#131b2e] text-sm font-semibold appearance-none outline-none pr-8 cursor-pointer"
                  value={dobMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                >
                  {DOB_MONTH_OPTIONS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-[#727786] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
              <div className="relative">
                <select
                  className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] border border-transparent focus:border-[#0055c4] text-[#131b2e] text-sm font-semibold appearance-none outline-none pr-8 cursor-pointer"
                  value={dobYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                >
                  {dobYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-[#727786] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Biological Sex */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#131b2e]">Biological Sex</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                className={`h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  gender === "boy"
                    ? "bg-[#0055c4] text-white border border-[#0055c4] shadow-sm"
                    : "bg-[#f2f3ff] text-[#131b2e] border border-transparent"
                }`}
                onClick={() => setGender("boy")}
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${gender === "boy" ? "text-white" : "text-[#0055c4]"}`}>
                  male
                </span>
                <span>Boy</span>
              </button>
              <button
                className={`h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  gender === "girl"
                    ? "bg-[#0055c4] text-white border border-[#0055c4] shadow-sm"
                    : "bg-[#f2f3ff] text-[#131b2e] border border-transparent"
                }`}
                onClick={() => setGender("girl")}
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${gender === "girl" ? "text-white" : "text-[#0055c4]"}`}>
                  female
                </span>
                <span>Girl</span>
              </button>
            </div>
          </div>
        </section>

        {/* Signs & Eye Symptoms Checklist */}
        <section className="bg-white border border-[#c2c6d7]/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0055c4] text-[18px]">visibility</span>
              <label className="text-xs font-bold uppercase tracking-wider text-[#424655]">
                Signs &amp; Eye Symptoms
              </label>
            </div>
            <span className="text-xs text-[#727786] font-semibold">Multi-select</span>
          </div>
          <p className="text-xs text-[#424655]">
            Tap any cues noticed at home, screens, or school:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            {[
              { key: "squinting", label: "Squinting / Eye Strain" },
              { key: "tv", label: "Sitting Close to TV" },
              { key: "rubbing", label: "Frequent Rubbing" },
              { key: "routine", label: "Routine Checkup" },
            ].map((chip) => {
              const isActive = symptoms[chip.key];
              return (
                <button
                  key={chip.key}
                  className={`text-left p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "border-[#0055c4]/30 bg-[#d9e2ff]/40 text-[#131b2e]"
                      : "border-[#c2c6d7]/20 bg-[#f2f3ff] text-[#131b2e]"
                  }`}
                  onClick={() => toggleSymptom(chip.key)}
                  type="button"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-[#0055c4] text-white"
                        : "bg-[#dae2fd] text-transparent"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span className="text-xs font-semibold leading-snug">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* HMO Coverage */}
        <section className="bg-white border border-[#c2c6d7]/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#424655]">
              Insurance Coverage
            </span>
            <span className="text-xs font-bold text-[#006847] bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check_circle</span> Active
            </span>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f2f3ff]/70 border border-[#0055c4]/20">
            <div className="w-10 h-10 rounded-xl bg-[#0055c4] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#131b2e]">Primary insurance plan</span>
                <span className="text-xs font-bold text-[#0055c4]">Covered</span>
              </div>
              <span className="text-xs text-[#424655] mt-0.5">
                Pediatric cycloplegic refraction &amp; consultation 100% included
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            className="w-full sm:flex-1 h-12 rounded-xl bg-[#066cf4] hover:bg-[#0055c4] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75"
            disabled={isSubmitting}
            onClick={handleSave}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Saving Dependent...</span>
              </>
            ) : (
              <>
                <span>Add Family Member</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
          <button
            className="w-full sm:w-auto px-6 h-12 rounded-xl border border-gray-200 text-center text-xs font-semibold text-[#424655] hover:text-[#0055c4] hover:bg-white transition-colors cursor-pointer"
            onClick={() => {
              showToast("Draft saved to family records.");
              setTimeout(() => router.push("/patient/select-profile"), 800);
            }}
            type="button"
          >
            Save for Later
          </button>
        </section>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto">
            <div className="bg-[#283044] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6ffbbe] text-[20px]">
                check_circle
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold">{toastMessage}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
