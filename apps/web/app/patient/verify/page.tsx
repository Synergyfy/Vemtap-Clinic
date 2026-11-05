"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read registered phone or fallback
  const phoneParam = searchParams.get("phone") || "+234 803 456 7890";
  const [digits, setDigits] = useState<string[]>(["5", "8", "2", "9", "", ""]);
  const [activeIndex, setActiveIndex] = useState(4);
  const [countdown, setCountdown] = useState(48);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    const lastChar = val.slice(-1);
    newDigits[index] = lastChar;
    setDigits(newDigits);

    if (lastChar && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Simulated numeric keypad input
  const handleKeypadPress = (val: string) => {
    if (val === "backspace") {
      const idx = digits[activeIndex] !== "" ? activeIndex : Math.max(0, activeIndex - 1);
      const newDigits = [...digits];
      newDigits[idx] = "";
      setDigits(newDigits);
      setActiveIndex(idx);
    } else {
      if (activeIndex <= 5) {
        const newDigits = [...digits];
        newDigits[activeIndex] = val;
        setDigits(newDigits);
        if (activeIndex < 5) {
          setActiveIndex(activeIndex + 1);
        }
      }
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      router.push("/patient/complete-profile");
    }, 900);
  };

  return (
    <div className="bg-[#faf8ff] font-[Inter,sans-serif] text-[#131b2e] flex flex-col min-h-screen antialiased selection:bg-[#0055c4]/20">
      {/* ── Fixed Top Navigation Bar ── */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e7ff]/60">
        <div className="h-16 px-4 flex items-center justify-between max-w-[440px] mx-auto">
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
                  Phone Verification
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

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-8">
        <div className="flex flex-col w-full max-w-[440px] mx-auto px-4">
          {/* Step Progression Bar */}
          <div className="w-full flex items-center justify-between pt-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#d9e2ff] text-[#001945] text-[12px] font-semibold">
                Step 2 of 3
              </span>
              <span className="text-[14px] text-[#424655]">Patient Registration</span>
            </div>
            <div aria-label="Step indicator" className="flex items-center gap-1.5">
              <div className="w-6 h-1.5 rounded-full bg-[#0055c4]"></div>
              <div className="w-6 h-1.5 rounded-full bg-[#0055c4]"></div>
              <div className="w-2.5 h-1.5 rounded-full bg-[#dae2fd]"></div>
            </div>
          </div>

          {/* Header Block */}
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[12px] font-semibold text-[#0055c4] tracking-wider uppercase">
              SECURITY &amp; AUTHENTICATION
            </span>
            <h1 className="text-[20px] font-bold text-[#131b2e] tracking-tight">
              Verify Your Mobile Phone
            </h1>
            <p className="text-[14px] text-[#424655] mt-0.5">
              We sent a 6-digit verification code via SMS to
            </p>

            {/* Phone Number Badge with Edit Option */}
            <div className="flex items-center mt-2">
              <div className="inline-flex items-center gap-2 bg-[#e2e7ff] px-3 py-1.5 rounded-full shadow-sm">
                <span
                  className="material-symbols-outlined text-[16px] text-[#0055c4]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  smartphone
                </span>
                <span className="text-[14px] font-semibold text-[#131b2e] font-mono tracking-wider">
                  {phoneParam.startsWith("+234") ? phoneParam : `+234 ${phoneParam}`}
                </span>
                <Link
                  className="inline-flex items-center gap-0.5 text-[#0055c4] hover:text-[#1759c4] text-[12px] font-semibold ml-1"
                  href="/patient/register"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* OTP Code Input Display */}
          <div className="flex flex-col gap-2 mb-5">
            <div className="flex items-center justify-between gap-2 w-full max-w-[360px] mx-auto">
              {digits.map((digit, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl shadow-sm flex items-center justify-center font-bold text-[22px] font-mono cursor-pointer transition-all ${
                    idx === activeIndex
                      ? "bg-white border-2 border-[#0055c4] shadow-md ring-2 ring-[#0055c4]/10"
                      : digit
                      ? "bg-white text-[#131b2e] border border-[#c2c6d7]/40"
                      : "bg-[#e2e7ff]/60 text-[#c2c6d7]"
                  }`}
                  onClick={() => {
                    setActiveIndex(idx);
                    inputRefs.current[idx]?.focus();
                  }}
                >
                  {idx === activeIndex && !digit ? (
                    <div className="w-0.5 h-6 bg-[#0055c4] animate-pulse rounded-full"></div>
                  ) : (
                    digit || "•"
                  )}
                  {/* Invisible input for direct keyboard support */}
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    className="sr-only"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                  />
                </div>
              ))}
            </div>

            {/* Micro State Notice */}
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[#424655] text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-[#006847]">check_circle</span>
              <span>Auto-reading SMS verification code...</span>
            </div>
          </div>

          {/* Resend & Alternative Delivery Options */}
          <div className="flex flex-col gap-2 bg-white rounded-xl p-3.5 shadow-sm border border-[#c2c6d7]/30 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#424655]">schedule</span>
                <span className="text-[13px] text-[#424655]">Didn&apos;t receive code?</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eaedff] text-[12px] font-semibold text-[#424655]">
                <span>Resend in</span>
                <span className="font-mono text-[#0055c4] font-semibold" id="countdown-timer">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-colors"
                onClick={() => showToast("WhatsApp verification code sent to your phone!")}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-[#006847]">chat</span>
                <span>Send via WhatsApp</span>
              </button>
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-semibold transition-colors"
                onClick={() => showToast("Connecting voice verification call...")}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-[#1759c4]">
                  phone_forwarded
                </span>
                <span>Receive Voice Call</span>
              </button>
            </div>
          </div>

          {/* Medical Record Linkage Shield Notice */}
          <div className="flex items-start gap-3 bg-[#f2f3ff] p-3.5 rounded-xl mb-5">
            <div className="w-8 h-8 rounded-full bg-[#d9e2ff] flex items-center justify-center shrink-0 mt-0.5">
              <span
                className="material-symbols-outlined text-[#0055c4] text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-bold text-[#131b2e]">
                Unified Patient Identification
              </span>
              <p className="text-[12px] text-[#424655] leading-relaxed">
                Your phone number safely links to your central VEMTAP Record ID (
                <span className="font-mono text-[#0055c4] font-semibold">#VEM</span>) to maintain
                ophthalmic diagnostics and optical prescriptions without duplicates.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-2 mb-5">
            <button
              className="w-full h-12 bg-[#0055c4] hover:bg-[#1759c4] text-white rounded-xl text-[16px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-75"
              disabled={isVerifying}
              onClick={handleVerify}
              type="button"
            >
              {isVerifying ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
            <button
              className="w-full py-2 text-center text-[#424655] hover:text-[#131b2e] text-[12px] font-semibold transition-colors"
              onClick={() => showToast("Optometry desk direct line: +234 1 800 VEMTAP")}
              type="button"
            >
              Need clinic assistance? Contact Optometry Desk
            </button>
          </div>

          {/* Simulated Integrated Numeric Keypad for Mobile Flow */}
          <div className="w-full max-w-[340px] mx-auto grid grid-cols-3 gap-2.5 pt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button
                key={n}
                className="h-12 rounded-xl bg-white border border-[#c2c6d7]/30 shadow-sm flex items-center justify-center text-[18px] font-bold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
                onClick={() => handleKeypadPress(n)}
                type="button"
              >
                {n}
              </button>
            ))}
            <div className="h-12 flex items-center justify-center"></div>
            <button
              className="h-12 rounded-xl bg-white border border-[#c2c6d7]/30 shadow-sm flex items-center justify-center text-[18px] font-bold text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
              onClick={() => handleKeypadPress("0")}
              type="button"
            >
              0
            </button>
            <button
              aria-label="Backspace"
              className="h-12 rounded-xl bg-white border border-[#c2c6d7]/30 shadow-sm flex items-center justify-center text-[#424655] hover:bg-[#eaedff] active:scale-95 transition-all"
              onClick={() => handleKeypadPress("backspace")}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">backspace</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PatientVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

