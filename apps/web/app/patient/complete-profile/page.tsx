"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [dobDay, setDobDay] = useState("14");
  const [dobMonth, setDobMonth] = useState("08");
  const [dobYear, setDobYear] = useState("1992");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [address, setAddress] = useState("Plot 18, Bishop Oluwole St, Victoria Island, Lagos");
  const [branch, setBranch] = useState("Victoria Island Clinic, Lagos");
  const [paymentType, setPaymentType] = useState<"hmo" | "self">("hmo");
  const [hmoProvider, setHmoProvider] = useState("AXA Mansard Health");
  const [policyNumber, setPolicyNumber] = useState("#AX-8910-LG");
  const [emergencyName, setEmergencyName] = useState("Folake Alade (Sister)");
  const [emergencyPhone, setEmergencyPhone] = useState("+234 803 456 7890");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      localStorage.setItem("vemtap_profile_completed", "true");
      localStorage.setItem(
        "vemtap_patient_info",
        JSON.stringify({
          patientId: "VEM-88219-LG",
          fullName: "Olumide Adeleke",
          gender,
          branch,
          paymentType,
          hmoProvider: paymentType === "hmo" ? hmoProvider : null,
          policyNumber: paymentType === "hmo" ? policyNumber : null,
        })
      );
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/patient/dashboard");
    }, 800);
  };

  return (
    <div className="bg-[#faf8ff] font-[Inter,sans-serif] text-[#131b2e] flex flex-col min-h-screen antialiased selection:bg-[#0055c4]/20">
      {/* ── Fixed Top Header ── */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e7ff]/60">
        <div className="h-16 px-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              aria-label="Back"
              className="w-11 h-11 -ml-1 flex items-center justify-center rounded-full text-[#131b2e] hover:bg-[#e2e7ff] transition-colors"
              onClick={() => router.back()}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0055c4]/10 flex items-center justify-center text-[#0055c4]">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] leading-4 text-[#0055c4] font-semibold tracking-wide uppercase">
                  VEMTAP EYE CLINIC
                </span>
                <span className="text-[16px] font-bold text-[#131b2e] leading-none">
                  Complete Patient Profile
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#0055c4] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Registration Form ── */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-8">
        <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5">
          {/* Step Tracker & Breadcrumb */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-[#e2e7ff] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#0055c4] animate-pulse"></span>
              <span className="text-[12px] font-semibold text-[#0055c4]">
                Step 3 of 3: Profile Setup
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-6 h-1 rounded-full bg-[#0055c4]"></span>
              <span className="w-6 h-1 rounded-full bg-[#0055c4]"></span>
              <span className="w-6 h-1 rounded-full bg-[#0055c4]"></span>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-[#0055c4] tracking-wider uppercase">
              CLINICAL REGISTRATION
            </span>
            <h1 className="text-[22px] font-bold text-[#131b2e] tracking-tight">
              Complete Patient Profile
            </h1>
            <p className="text-[14px] text-[#424655]">
              Enter essential details to generate your official VEMTAP Patient ID.
            </p>
          </div>

          {/* Patient ID Preview Pill */}
          <div className="bg-[#f2f3ff] px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm border border-[#e2e7ff]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#0055c4]">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#0055c4] uppercase tracking-tight">
                  Temporary ID
                </span>
                <span className="text-[13px] font-bold text-[#131b2e] font-mono">
                  #VEM-88219-PENDING
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#424655] bg-white px-2 py-0.5 rounded-full border border-[#c2c6d7]/30">
              Lagos Registry
            </span>
          </div>

          {/* Verification Graphic / Trust Badge */}
          <div className="relative overflow-hidden rounded-xl bg-[#f2f3ff] p-3.5 flex items-center gap-3 shadow-sm border border-[#e2e7ff]/50">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <img
                className="w-full h-full object-cover"
                alt="Optometrist examining optical lenses"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfcKcZexPvb8w3DljkoMmDcv-Tc7nVDyavCN1nT29jkNj_MhpmHyvMtJPs2HrMf1oNHMT7JxKduEfqleWH8E7s3sQ82HmtcLWegSjkZlhFcWAfKAD_lWdLycg9PmVS6lQd0b3FsuyRO_e2EtX39wxlIgZx3__PbQHZsQNyIBambEeNqukUsYqhuHrFRO3-lsqFCnlLf5kknQMMli118Os1qYCrXAnt_6zw8Q65SDFJ"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 text-[#006847]">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="text-[12px] font-bold">HIPAA &amp; NDPR Secured</span>
              </div>
              <p className="text-[12px] text-[#424655] mt-0.5 leading-snug">
                Direct integration with Federal Ophthalmic Board registry.
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Field 1: Date of Birth */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#131b2e]">
                Date of Birth <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#f2f3ff] rounded-xl px-3 py-2 flex flex-col justify-center border border-[#e2e7ff]/70 shadow-sm">
                  <span className="text-[11px] text-[#424655] font-medium">Day</span>
                  <input
                    className="bg-transparent font-bold text-[16px] text-[#131b2e] outline-none w-full"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="14"
                    type="text"
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                  />
                </div>
                <div className="bg-[#f2f3ff] rounded-xl px-3 py-2 flex flex-col justify-center border border-[#e2e7ff]/70 shadow-sm">
                  <span className="text-[11px] text-[#424655] font-medium">Month</span>
                  <input
                    className="bg-transparent font-bold text-[16px] text-[#131b2e] outline-none w-full"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="08"
                    type="text"
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                  />
                </div>
                <div className="bg-[#f2f3ff] rounded-xl px-3 py-2 flex flex-col justify-center border border-[#e2e7ff]/70 shadow-sm">
                  <span className="text-[11px] text-[#424655] font-medium">Year</span>
                  <input
                    className="bg-transparent font-bold text-[16px] text-[#131b2e] outline-none w-full"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1992"
                    type="text"
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Field 2: Biological Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#131b2e]">
                Gender <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`h-11 rounded-xl text-[13px] font-semibold shadow-sm flex items-center justify-center gap-1 transition-all ${
                    gender === "male"
                      ? "bg-[#0055c4] text-white"
                      : "bg-[#f2f3ff] text-[#131b2e] border border-[#e2e7ff]/70"
                  }`}
                  onClick={() => setGender("male")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">male</span>
                  <span>Male</span>
                </button>
                <button
                  className={`h-11 rounded-xl text-[13px] font-semibold shadow-sm flex items-center justify-center gap-1 transition-all ${
                    gender === "female"
                      ? "bg-[#0055c4] text-white"
                      : "bg-[#f2f3ff] text-[#131b2e] border border-[#e2e7ff]/70"
                  }`}
                  onClick={() => setGender("female")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">female</span>
                  <span>Female</span>
                </button>
                <button
                  className={`h-11 rounded-xl text-[13px] font-semibold shadow-sm flex items-center justify-center gap-1 transition-all ${
                    gender === "other"
                      ? "bg-[#0055c4] text-white"
                      : "bg-[#f2f3ff] text-[#131b2e] border border-[#e2e7ff]/70"
                  }`}
                  onClick={() => setGender("other")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">transgender</span>
                  <span>Other</span>
                </button>
              </div>
            </div>

            {/* Field 3: Home Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#131b2e]">
                Home Address <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="bg-[#f2f3ff] rounded-xl px-3.5 py-3 flex items-center gap-2 border border-[#e2e7ff]/70 shadow-sm">
                <span className="material-symbols-outlined text-[#727786] text-[20px]">home_pin</span>
                <input
                  className="bg-transparent text-[14px] text-[#131b2e] outline-none w-full"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Field 4: Preferred Clinic Branch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#131b2e]">
                Preferred Clinic Branch <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-1 border border-[#e2e7ff]/70 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0055c4]">
                    <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                    <span className="text-[13px] font-bold">{branch}</span>
                  </div>
                  <span className="material-symbols-outlined text-[#727786] text-[20px]">expand_more</span>
                </div>
                <span className="text-[12px] text-[#424655]">
                  Plot 14 Adeola Odeku Street • Open Mon-Sat
                </span>
              </div>
            </div>

            {/* Field 5: Healthcare Payment Method */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#131b2e]">
                  Healthcare Payment Method
                </label>
                <span className="text-[11px] text-[#006847] flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  <span>Verified Network</span>
                </span>
              </div>

              {/* Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#e2e7ff] p-1 rounded-xl">
                <button
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-all ${
                    paymentType === "hmo"
                      ? "bg-[#0055c4] text-white shadow-sm"
                      : "text-[#424655] hover:text-[#131b2e]"
                  }`}
                  onClick={() => setPaymentType("hmo")}
                  type="button"
                >
                  HMO / Insurance
                </button>
                <button
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-all ${
                    paymentType === "self"
                      ? "bg-[#0055c4] text-white shadow-sm"
                      : "text-[#424655] hover:text-[#131b2e]"
                  }`}
                  onClick={() => setPaymentType("self")}
                  type="button"
                >
                  Self-Pay Patient
                </button>
              </div>

              {/* HMO Detail Fields Container */}
              {paymentType === "hmo" && (
                <div className="bg-[#f2f3ff] p-3 rounded-xl flex flex-col gap-3 shadow-sm border border-[#e2e7ff]/70">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#424655]">Insurance Provider</label>
                    <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between border border-[#c2c6d7]/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0055c4] text-[20px]">
                          health_and_safety
                        </span>
                        <span className="text-[13px] font-bold text-[#131b2e]">{hmoProvider}</span>
                      </div>
                      <span className="material-symbols-outlined text-[#727786] text-[18px]">
                        unfold_more
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#424655]">
                      Policy / Enrollee Number
                    </label>
                    <div className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 border border-[#c2c6d7]/30">
                      <span className="material-symbols-outlined text-[#727786] text-[18px]">pin</span>
                      <input
                        className="bg-transparent text-[13px] text-[#131b2e] font-mono font-semibold outline-none w-full"
                        type="text"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-[#dae2fd]/50 p-2.5 rounded-lg">
                    <span className="material-symbols-outlined text-[#0055c4] text-[16px] shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="text-[11px] text-[#424655] leading-tight">
                      Your HMO eligibility will be pre-verified for eye consultations and lenses.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Field 6: Emergency Contact */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#131b2e]">
                  Emergency Contact
                </label>
                <span className="text-[11px] text-[#727786]">Optional</span>
              </div>
              <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2 border border-[#e2e7ff]/70 shadow-sm">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#c2c6d7]/30">
                  <span className="material-symbols-outlined text-[#727786] text-[18px]">person</span>
                  <input
                    className="bg-transparent text-[13px] text-[#131b2e] outline-none w-full"
                    placeholder="Contact Full Name"
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#c2c6d7]/30">
                  <span className="material-symbols-outlined text-[#727786] text-[18px]">call</span>
                  <input
                    className="bg-transparent text-[13px] text-[#131b2e] outline-none w-full font-mono"
                    placeholder="+234 Phone Number"
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick Opt-In Checkbox */}
            <label className="flex items-start gap-2.5 select-none cursor-pointer pt-1">
              <input
                checked={whatsappOptIn}
                className="mt-0.5 w-4 h-4 rounded text-[#0055c4] border-[#c2c6d7] focus:ring-0 cursor-pointer"
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                type="checkbox"
              />
              <span className="text-[12px] text-[#424655] leading-snug">
                Send optical prescription cards and appointment alerts to my WhatsApp number.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 pb-6">
              <button
                className="h-12 w-full rounded-xl bg-[#0055c4] text-white text-[15px] font-bold shadow-md flex items-center justify-center gap-2 hover:bg-[#1759c4] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Patient ID...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Open Patient Dashboard</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              <button
                className="h-11 w-full rounded-xl bg-transparent text-[#424655] text-[13px] font-semibold hover:bg-[#eaedff] transition-colors flex items-center justify-center"
                onClick={() => router.push("/patient/dashboard")}
                type="button"
              >
                I&apos;ll complete this at the clinic
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

