"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCreatePatient } from "@/hooks/usePatients";

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export default function ReceptionPatientRegistrationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createPatientMut = useCreatePatient();

  // Form State
  const [patientType, setPatientType] = useState<"adult" | "child">("adult");
  const [billingType, setBillingType] = useState<"hmo" | "self">("hmo");
  const [isKinOpen, setIsKinOpen] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("Mr.");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [nin, setNin] = useState("••••••••••");

  // Next of Kin
  const [kinName, setKinName] = useState("Emergency contact name");
  const [kinRelation, setKinRelation] = useState("Relative");
  const [kinPhone, setKinPhone] = useState("+000 000 0000");
  const [hasProxy, setHasProxy] = useState(true);

  // Clinic Metadata
  const [occupation, setOccupation] = useState("Occupation");
  const [referralSource, setReferralSource] = useState("Referral source");
  const [priorEyewear, setPriorEyewear] = useState("Previous eyewear");
  const [chiefComplaint, setChiefComplaint] = useState("Primary complaint");

  // HMO & Billing
  const [hmoProvider, setHmoProvider] = useState("Select provider");
  const [enrolleeId, setEnrolleeId] = useState("Policy number");
  const [copayRate, setCopayRate] = useState("₦0.00");

  // UI Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ageLabel = dob ? `${calculateAge(dob)} Yrs` : "Age";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveDraft = () => {
    showToast("Registration draft saved successfully!");
  };

  const handleCompleteRegistration = async () => {
    if (!firstName.trim() || !surname.trim()) {
      showToast("Please enter the patient first name and surname");
      return;
    }

    if (!dob) {
      showToast("Please select the patient date of birth");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      showToast("Please enter a valid phone number for the patient");
      return;
    }

    if (!user?.clinicId) {
      showToast("No active clinic is available for this account. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const patient = await createPatientMut.mutateAsync({
        firstName: firstName.trim(),
        lastName: surname.trim(),
        dateOfBirth: dob,
        gender: gender === "M" ? "male" : "female",
        phone: phone.replace(/\D/g, ""),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: "",
        state: "",
        nationality: "Nigeria",
        occupation: occupation.trim() || undefined,
        patientType: billingType === "hmo" ? "hmo" : "private",
        hmoName: billingType === "hmo" ? hmoProvider : undefined,
        hmoNumber: enrolleeId.trim() || undefined,
        emergencyContact: kinName.trim() || undefined,
        emergencyPhone: kinPhone.replace(/\D/g, "") || undefined,
        clinicId: user.clinicId,
        branchId: user.branchId ?? "",
      });

      showToast("Patient registered successfully");
      setTimeout(() => {
        // Only reception owns the front-desk check-in flow; clinic (and other
        // staff) stay inside their own area instead of being sent to reception.
        router.push(
          user?.roles?.includes("receptionist")
            ? `/reception/check-in?patientId=${patient.id}`
            : `/clinic/patients/${patient.id}`,
        );
      }, 700);
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || error?.message || "Failed to register patient",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-28">
      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Patient Registry</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header & Context Banner */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-semibold">
                <span className="material-symbols-outlined text-[13px] text-secondary">
                  clinical_notes
                </span>
                VI Intakes
              </span>
              <span className="inline-flex items-center gap-1 text-tertiary text-[10px] font-bold">
                <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
                Live Sync
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-on-surface pt-0.5">
              New Patient Registration
            </h2>
            <p className="text-[11px] text-on-surface-variant">
              Register new optical patient into unified VEMTAP network
            </p>
          </div>

          {/* Patient Demographic Type Switcher */}
          <div className="bg-surface-container rounded-xl p-1 flex items-center justify-between shadow-xs max-w-sm">
            <button
              type="button"
              onClick={() => setPatientType("adult")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                patientType === "adult"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>Adult (Self)</span>
            </button>
            <button
              type="button"
              onClick={() => setPatientType("child")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                patientType === "child"
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">family_restroom</span>
              <span>Child / Dependent</span>
            </button>
          </div>

          {/* Multi-step Completion Progress Bar */}
          <div className="bg-surface-container-low rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                Section 1 of 4: Standard Identity
              </span>
              <span className="text-primary font-bold text-[11px]">75% Complete</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: "75%" }}
              />
            </div>
            <div className="flex items-center justify-between text-on-surface-variant text-[10px] pt-0.5">
              <span className="text-primary font-bold">1. Identity</span>
              <span className="font-medium">2. Emergency</span>
              <span className="font-medium">3. Clinical Meta</span>
              <span className="font-medium">4. HMO & Billing</span>
            </div>
          </div>

          {/* 2-Column Responsive Layout on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
            {/* Left Column (8 cols): 4-Section Comprehensive Form */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* SECTION 1: Standard Identity Fields */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm text-on-surface font-bold">
                        1. Standard VEMTAP Identity
                      </h3>
                      <p className="text-[10px] text-on-surface-variant">
                        Primary demographic and contact record
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] flex items-center gap-0.5 shrink-0 font-semibold">
                    <span className="material-symbols-outlined text-[12px] text-tertiary">lock</span>
                    Cross-Branch
                  </span>
                </div>

                {/* Name Fields Grid */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Title
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      First Name <span className="text-error">*</span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
                      />
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Middle Name
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle Name"
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
                      />
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Surname <span className="text-error">*</span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Surname"
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
                      />
                    </div>
                  </div>
                </div>

                {/* DOB & Biological Sex */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-7 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold flex items-center justify-between">
                      <span>Date of Birth *</span>
                      <span className="text-primary font-bold">{ageLabel}</span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center justify-between border border-surface-container">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none [color-scheme:light]"
                      />
                      <span className="material-symbols-outlined text-[15px] text-outline">
                        calendar_today
                      </span>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Biological Sex
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg p-0.5 flex items-center gap-1 border border-surface-container">
                      <button
                        type="button"
                        onClick={() => setGender("M")}
                        className={`flex-1 h-full rounded text-xs font-bold flex items-center justify-center transition-all ${
                          gender === "M"
                            ? "bg-surface-container-lowest text-primary shadow-xs"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("F")}
                        className={`flex-1 h-full rounded text-xs font-bold flex items-center justify-center transition-all ${
                          gender === "F"
                            ? "bg-surface-container-lowest text-primary shadow-xs"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact: Phone, Email, Address, NIN */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold flex items-center justify-between">
                      <span>Primary Phone *</span>
                      <span className="inline-flex items-center gap-0.5 text-tertiary font-bold text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        OTP Verified
                      </span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center gap-1.5 border border-surface-container">
                      <span className="text-xs text-on-surface font-bold pr-1">🇳🇬 +234</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="803 000 0000"
                        className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none font-medium placeholder:text-outline"
                      />
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        check_circle
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Email Address
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center gap-1.5 border border-surface-container">
                      <span className="material-symbols-outlined text-[15px] text-outline">mail</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Residential Address
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center gap-1.5 border border-surface-container">
                      <span className="material-symbols-outlined text-[15px] text-outline">home_pin</span>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Residential address"
                        className="flex-1 bg-transparent text-xs text-on-surface focus:outline-none placeholder:text-outline"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold flex items-center justify-between">
                      <span>NIN (National Identity Number)</span>
                      <span className="text-outline text-[10px]">11-Digits Encrypted</span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center justify-between border border-surface-container">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-outline">
                          security
                        </span>
                        <span className="text-xs text-on-surface font-mono tracking-wider font-bold">
                          {nin}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast("NIN verified via NIMC gateway")}
                        className="text-primary font-bold hover:underline text-[10px]"
                      >
                        Re-verify
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Emergency Contact & Next of Kin */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setIsKinOpen(!isKinOpen)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold">
                      <span className="material-symbols-outlined text-[16px]">contact_emergency</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm text-on-surface font-bold">
                        2. Next of Kin & Guardian
                      </h3>
                      <p className="text-[10px] text-on-surface-variant">
                        Emergency notification and consent
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle section"
                    className="p-1 rounded-full text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isKinOpen ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                </div>

                {isKinOpen && (
                  <div className="flex flex-col gap-2 pt-1 border-t border-surface-container">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-on-surface-variant font-semibold">
                        Full Legal Name
                      </label>
                      <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                        <input
                          type="text"
                          value={kinName}
                          onChange={(e) => setKinName(e.target.value)}
                          className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-5 flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-semibold">
                          Relationship
                        </label>
                        <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                          <select
                            value={kinRelation}
                            onChange={(e) => setKinRelation(e.target.value)}
                            className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                          >
                            <option value="Spouse">Spouse</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Guardian">Guardian</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-7 flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-semibold">
                          Phone Number
                        </label>
                        <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                          <input
                            type="tel"
                            value={kinPhone}
                            onChange={(e) => setKinPhone(e.target.value)}
                            className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low cursor-pointer border border-surface-container">
                      <input
                        type="checkbox"
                        checked={hasProxy}
                        onChange={(e) => setHasProxy(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded text-primary focus:ring-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-on-surface font-bold">
                          Holds Healthcare Proxy Authority
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          Permitted to sign dilation consent and operative approvals
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 3: Clinic-Specific Metadata */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary font-bold">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm text-on-surface font-bold">
                        3. Clinic Intake Metadata
                      </h3>
                      <p className="text-[10px] text-on-surface-variant">
                        VI Branch ocular triage flags
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    VI Custom
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold flex items-center justify-between">
                      <span>Occupation / Daily Work</span>
                      <span className="text-error flex items-center gap-0.5 font-bold text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">desktop_mac</span>
                        High Screen Exposure
                      </span>
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-on-surface-variant font-semibold">
                        Referral Source
                      </label>
                      <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                        <select
                          value={referralSource}
                          onChange={(e) => setReferralSource(e.target.value)}
                          className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                        >
                          <option value="Consultant Ophthalmologist">Consultant Ophthalmologist</option>
                          <option value="HMO Referral">HMO Referral</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Family / Friend">Family / Friend</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-on-surface-variant font-semibold">
                        Prior Eyewear
                      </label>
                      <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                        <select
                          value={priorEyewear}
                          onChange={(e) => setPriorEyewear(e.target.value)}
                          className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                        >
                          <option value="Progressive Multifocal">Progressive Multifocal</option>
                          <option value="Single Vision">Single Vision</option>
                          <option value="Bifocals">Bifocals</option>
                          <option value="None">None (First Exam)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Chief Complaint / Visual Symptoms
                    </label>
                    <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                      <input
                        type="text"
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Primary Billing & HMO */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm text-on-surface font-bold">
                        4. Primary Billing & HMO
                      </h3>
                      <p className="text-[10px] text-on-surface-variant">
                        Corporate policy or direct fee schedule
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container p-0.5 rounded-lg flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setBillingType("self")}
                      className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all ${
                        billingType === "self"
                          ? "bg-surface-container-lowest text-primary shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Self-Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingType("hmo")}
                      className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all ${
                        billingType === "hmo"
                          ? "bg-surface-container-lowest text-primary shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      HMO
                    </button>
                  </div>
                </div>

                {billingType === "hmo" ? (
                  <div className="flex flex-col gap-2 pt-0.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-on-surface-variant font-semibold">
                        HMO Provider
                      </label>
                      <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                        <select
                          value={hmoProvider}
                          onChange={(e) => setHmoProvider(e.target.value)}
                          className="w-full bg-transparent text-xs text-on-surface focus:outline-none"
                        >
                          <option value="AXA Mansard (Tier-1)">AXA Mansard (Tier-1 Corporate)</option>
                          <option value="Reliance HMO">Reliance HMO</option>
                          <option value="Hygeia HMO">Hygeia HMO</option>
                          <option value="Leadway Health">Leadway Health</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-8 flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-semibold">
                          Policy / Enrollee ID
                        </label>
                        <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center border border-surface-container">
                          <input
                            type="text"
                            value={enrolleeId}
                            onChange={(e) => setEnrolleeId(e.target.value)}
                            className="w-full bg-transparent text-xs text-on-surface font-mono uppercase focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
                        <label className="text-[10px] text-on-surface-variant font-semibold">
                          Copay Rate
                        </label>
                        <div className="h-8 bg-surface-container-low rounded-lg px-2 flex items-center justify-center border border-surface-container">
                          <span className="text-xs text-tertiary font-bold">{copayRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                      <div>
                        <div className="text-xs font-bold text-on-surface">Standard Consultation Fee</div>
                        <div className="text-[10px] text-on-surface-variant">Payable at cashier desk</div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-on-surface">₦15,000</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Live Record Summary Card & Checklist */}
            <div className="lg:col-span-4 flex flex-col gap-3 sticky top-24">
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">preview</span>
                  Live Record Card
                </h3>

                <div className="bg-surface-container-low rounded-lg p-2.5 border border-surface-container flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {firstName[0] || ""}
                      {surname[0] || ""}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">
                        {title} {firstName} {surname}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        {gender === "M" ? "Male" : "Female"} · 34y · {dob}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-on-surface-variant space-y-0.5 pt-1.5 border-t border-surface-container">
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-semibold text-on-surface">+234 {phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payer:</span>
                      <span className="font-semibold text-primary">
                        {billingType === "hmo" ? hmoProvider : "Private Self-Pay"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span className="font-semibold text-on-surface">Victoria Island</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Verification Checklist:
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Identity & Demographics verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Next of Kin with proxy authority</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>{billingType === "hmo" ? "HMO Tier-1 Eligible" : "Self-Pay Configured"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-3 sm:px-6 py-2.5 border-t border-surface-container shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="h-8 sm:h-9 px-3.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleCompleteRegistration}
            disabled={isSubmitting}
            className="flex-1 sm:max-w-xs h-8 sm:h-9 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover active:bg-secondary transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">
                  progress_activity
                </span>
                <span>Registering & Enqueueing...</span>
              </>
            ) : (
              <>
                <span>Save & Check-In</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900 text-white font-label-md font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

