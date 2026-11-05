"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientRegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"individual" | "guardian">("individual");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getStrengthLevel = () => {
    if (password.length >= 8) return 3;
    if (password.length >= 6) return 2;
    if (password.length >= 3) return 1;
    return 0;
  };

  const strength = getStrengthLevel();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid Nigerian mobile phone number.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must accept the Patient Data Terms to continue.");
      return;
    }

    setIsLoading(true);
    // Store onboarding draft in sessionStorage so verify & complete profile can access it
    try {
      sessionStorage.setItem(
        "vemtap_registration_draft",
        JSON.stringify({
          fullName,
          phone,
          email,
          accountType,
        })
      );
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push(`/patient/verify?phone=${encodeURIComponent(phone)}`);
    }, 800);
  };

  return (
    <div className="bg-[#faf8ff] font-[Inter,sans-serif] text-[#131b2e] flex flex-col min-h-screen antialiased selection:bg-[#0055c4]/20">
      {/* ── Fixed Top Header ── */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e7ff]/60">
        <div className="h-16 px-4 flex items-center justify-between max-w-xl mx-auto">
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
                  Create Account
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

      {/* ── Main Scrollable Body ── */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-8">
        <div className="flex flex-col w-full max-w-xl mx-auto px-4">
          {/* Step Progression Bar */}
          <div className="pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#d9e2ff] text-[#001945]">
                Step 1 of 3
              </span>
              <span className="text-[12px] font-semibold text-[#727786]">Account Setup</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-1.5 rounded-full bg-[#0055c4]"></div>
              <div className="w-2 h-1.5 rounded-full bg-[#dae2fd]"></div>
              <div className="w-2 h-1.5 rounded-full bg-[#dae2fd]"></div>
            </div>
          </div>

          {/* Hero Imagery Banner */}
          <div className="pt-1 pb-3">
            <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-sm flex items-end p-3">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="Modern ophthalmic diagnostic lens"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx7K49xvelT9IBKcpIpE9qO4SJS5RKdKgARiGrL-bf28axqbI_9dom6fmVAON2y7Az7YLUsBztbE7L2rvSAK_BOixufii8uatRWL89xX4FusDXzexRmcYf-OkyLuAF9R81ZuMV7e_AACZwnIMeFN7xplo04r9-_uBAqKHivr9fC0HeCesC7UNWx7stCRKBDaInotJ_Ob35Gu77UTp7wO3KR5M0FiWw60v_fUaJb4dB"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/85 via-[#283044]/30 to-transparent"></div>
              <div className="relative z-10 flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[18px] text-[#6ffbbe]">
                  verified_user
                </span>
                <span className="text-[12px] font-semibold tracking-wide">
                  Secure Nigerian Healthcare Data Portability
                </span>
              </div>
            </div>
          </div>

          {/* Header Typography Section */}
          <div className="pt-2 pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#0055c4]">
                visibility
              </span>
              <span className="text-[12px] font-semibold text-[#0055c4] tracking-wider uppercase">
                New Patient Registration
              </span>
            </div>
            <h1 className="text-[22px] leading-7 font-bold text-[#131b2e] tracking-tight mb-1">
              Create Your Account
            </h1>
            <p className="text-[14px] text-[#424655]">
              One central account for your appointments, records, and family eye care.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Account Type Quick Segmented Selector */}
          <div className="mb-5">
            <div className="p-1 rounded-xl bg-[#eaedff] flex gap-1">
              <button
                className={`flex-1 py-2 px-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  accountType === "individual"
                    ? "bg-white shadow-sm text-[#0055c4]"
                    : "bg-transparent text-[#424655]"
                }`}
                onClick={() => setAccountType("individual")}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Individual Patient</span>
              </button>
              <button
                className={`flex-1 py-2 px-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  accountType === "guardian"
                    ? "bg-white shadow-sm text-[#0055c4]"
                    : "bg-transparent text-[#424655]"
                }`}
                onClick={() => setAccountType("guardian")}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                <span>Family / Guardian</span>
              </button>
            </div>
            {accountType === "guardian" && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-[#f2f3ff] text-[#424655] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#0055c4] shrink-0 mt-0.5">
                  info
                </span>
                <span className="text-[13px] leading-snug">
                  Guardian profiles allow managing dependent minors and elderly relatives under one medical ledger.
                </span>
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form className="flex flex-col gap-4" onSubmit={handleContinue}>
            {/* Field 1: Full Legal Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#131b2e] flex items-center justify-between" htmlFor="fullName">
                <span>Full Name (as on ID / HMO)</span>
                <span className="text-[#ba1a1a] text-[12px]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-[#727786] text-[20px] pointer-events-none">
                  badge
                </span>
                <input
                  className="w-full h-[52px] pl-11 pr-3 rounded-xl bg-white border border-[#c2c6d7]/40 text-[#131b2e] text-[15px] placeholder:text-[#727786]/70 focus:outline-none focus:border-[#0055c4] focus:ring-1 focus:ring-[#0055c4] transition-all"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Olumide Adeleke"
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Field 2: Mobile Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#131b2e] flex items-center justify-between" htmlFor="phone">
                <span>Mobile Phone Number</span>
                <span className="text-[#ba1a1a] text-[12px]">*</span>
              </label>
              <div className="relative flex items-center rounded-xl bg-white border border-[#c2c6d7]/40 overflow-hidden focus-within:border-[#0055c4] focus-within:ring-1 focus-within:ring-[#0055c4] transition-all">
                <div className="h-[52px] px-3 bg-[#eaedff] flex items-center gap-1.5 shrink-0 text-[#131b2e]">
                  <div className="w-4 h-3 rounded-xs overflow-hidden flex flex-col justify-between">
                    <span className="w-full h-1 bg-[#006847]"></span>
                    <span className="w-full h-1 bg-white"></span>
                    <span className="w-full h-1 bg-[#006847]"></span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#131b2e]">+234</span>
                </div>
                <input
                  className="w-full h-[52px] px-3.5 bg-transparent text-[#131b2e] text-[15px] placeholder:text-[#727786]/70 focus:outline-none"
                  id="phone"
                  maxLength={11}
                  name="phone"
                  placeholder="803 123 4567"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-[12px] text-[#424655] flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-[#006847]">sms</span>
                <span>We will send an instant SMS verification code</span>
              </p>
            </div>

            {/* Field 3: Email Address (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#131b2e] flex items-center justify-between" htmlFor="email">
                <span>Email Address (Optional)</span>
                <span className="text-[12px] text-[#727786] font-normal">For digital receipts</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-[#727786] text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  className="w-full h-[52px] pl-11 pr-3 rounded-xl bg-white border border-[#c2c6d7]/40 text-[#131b2e] text-[15px] placeholder:text-[#727786]/70 focus:outline-none focus:border-[#0055c4] focus:ring-1 focus:ring-[#0055c4] transition-all"
                  id="email"
                  name="email"
                  placeholder="olumide.adeleke@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Field 4: Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#131b2e] flex items-center justify-between" htmlFor="password">
                <span>Password</span>
                <span className="text-[#ba1a1a] text-[12px]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-[#727786] text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  className="w-full h-[52px] pl-11 pr-11 rounded-xl bg-white border border-[#c2c6d7]/40 text-[#131b2e] text-[15px] placeholder:text-[#727786]/70 focus:outline-none focus:border-[#0055c4] focus:ring-1 focus:ring-[#0055c4] transition-all"
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-2.5 w-8 h-8 flex items-center justify-center rounded-full text-[#424655] hover:bg-[#eaedff] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength >= 1 ? (strength === 1 ? "bg-[#ba1a1a]" : strength === 2 ? "bg-[#1759c4]" : "bg-[#006847]") : "bg-[#eaedff]"
                  }`}
                ></div>
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength >= 2 ? (strength === 2 ? "bg-[#1759c4]" : "bg-[#006847]") : "bg-[#eaedff]"
                  }`}
                ></div>
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength >= 3 ? "bg-[#006847]" : "bg-[#eaedff]"
                  }`}
                ></div>
                <span className="text-[11px] font-semibold text-[#727786] ml-1">
                  {strength === 0 && "Must be at least 8 chars"}
                  {strength === 1 && "Weak"}
                  {strength === 2 && "Good"}
                  {strength === 3 && "Strong"}
                </span>
              </div>
            </div>

            {/* Field 5: Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#131b2e] flex items-center justify-between" htmlFor="confirmPassword">
                <span>Confirm Password</span>
                <span className="text-[#ba1a1a] text-[12px]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-[#727786] text-[20px] pointer-events-none">
                  lock_reset
                </span>
                <input
                  className="w-full h-[52px] pl-11 pr-11 rounded-xl bg-white border border-[#c2c6d7]/40 text-[#131b2e] text-[15px] placeholder:text-[#727786]/70 focus:outline-none focus:border-[#0055c4] focus:ring-1 focus:ring-[#0055c4] transition-all"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  aria-label="Toggle confirm password visibility"
                  className="absolute right-2.5 w-8 h-8 flex items-center justify-center rounded-full text-[#424655] hover:bg-[#eaedff] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms Checkbox Section */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  checked={agreeTerms}
                  className="mt-1 w-4 h-4 rounded text-[#0055c4] border-[#c2c6d7] focus:ring-0 cursor-pointer"
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  type="checkbox"
                />
                <span className="text-[13px] text-[#424655] leading-snug">
                  I accept the{" "}
                  <Link className="text-[#0055c4] font-semibold hover:underline" href="#">
                    Patient Data Terms
                  </Link>{" "}
                  and agree to VEMTAP&apos;s{" "}
                  <Link className="text-[#0055c4] font-semibold hover:underline" href="#">
                    Health Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Action Primary Button */}
            <div className="pt-2">
              <button
                className="w-full h-12 rounded-xl bg-[#0055c4] text-white text-[16px] font-semibold shadow-sm hover:bg-[#1759c4] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Generating SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Phone Verification</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Clinic Assurance Trust Ribbon */}
          <div className="pt-5 pb-2">
            <div className="p-3 rounded-xl bg-[#f2f3ff] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5d8ffe]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#002867] text-[20px]">
                  health_and_safety
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold text-[#131b2e] truncate">
                  VEMTAP Clinical Confidentiality
                </span>
                <span className="text-[12px] text-[#424655] truncate">
                  NDPR compliant • End-to-end encrypted medical files
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Footer Link */}
          <div className="pt-3 pb-4 text-center">
            <p className="text-[14px] text-[#424655]">
              Already registered at a VEMTAP clinic?
              <Link
                className="text-[14px] font-semibold text-[#0055c4] ml-1 hover:underline inline-flex items-center"
                href="/patient/login"
              >
                Sign In
                <span className="material-symbols-outlined text-[16px] ml-0.5">login</span>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
