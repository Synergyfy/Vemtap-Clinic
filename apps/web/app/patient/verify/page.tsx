"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSendPatientEmailOtp, useSendPatientOtp, useVerifyPatientEmailOtp, useVerifyPatientOtp } from "@/hooks/usePatientPortal";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const phoneParam = useMemo(() => searchParams.get("phone") || "", [searchParams]);
  const sendOtpMutation = useSendPatientOtp();
  const verifyOtpMutation = useVerifyPatientOtp();
  const sendEmailOtpMutation = useSendPatientEmailOtp();
  const verifyEmailOtpMutation = useVerifyPatientEmailOtp();

  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [status, setStatus] = useState("Preparing verification...");
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async () => {
    setError(null);

    if (emailParam) {
      setStatus("Sending verification code...");

      try {
        const result = await sendEmailOtpMutation.mutateAsync(emailParam);
        if (result.code) {
          setDebugCode(result.code);
          setStatus(`Verification code sent to ${emailParam}. Use the code below while testing locally.`);
        } else {
          setStatus(`Verification code sent to ${emailParam}. Check your inbox and spam folder, then enter the 6-digit code below.`);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "We couldn’t send the verification code.");
        setStatus("Please try again.");
      }
      return;
    }

    if (!phoneParam) {
      setError("A mobile number is required for verification.");
      return;
    }

    setStatus("Sending verification code...");

    try {
      const result = await sendOtpMutation.mutateAsync(phoneParam);
      if (result.code) {
        setDebugCode(result.code);
        setStatus(`Verification code sent to ${phoneParam}. Use the code below while testing locally.`);
      } else {
        setStatus(`Verification code sent to ${phoneParam}. Enter the 6-digit code below.`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "We couldn’t send the verification code.");
      setStatus("Please try again.");
    }
  };

  useEffect(() => {
    void requestOtp();
  }, [emailParam, phoneParam]);

  const handleVerify = async () => {
    if (emailParam) {
      if (code.length !== 6) {
        setError("Enter the 6-digit verification code you received.");
        return;
      }

      try {
        const result = await verifyEmailOtpMutation.mutateAsync({ email: emailParam, code });
        if (result.verified) {
          router.push("/patient/complete-profile");
          return;
        }
        setError("That code is incorrect or has expired. Please request a new one.");
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Verification failed. Please try again.");
      }
      return;
    }

    if (!phoneParam) {
      setError("A valid phone number is required.");
      return;
    }

    if (code.length !== 6) {
      setError("Enter the 6-digit OTP code you received.");
      return;
    }

    try {
      const result = await verifyOtpMutation.mutateAsync({ phone: phoneParam, code });
      if (result.verified) {
        router.push("/patient/complete-profile");
        return;
      }
      setError("That code is incorrect or has expired. Please request a new one.");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="bg-[#faf8ff] font-[Inter,sans-serif] text-[#131b2e] flex flex-col min-h-screen antialiased selection:bg-[#0055c4]/20">
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
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] leading-4 text-[#0055c4] font-semibold tracking-wide uppercase">
                  VEMTAP EYE CLINIC
                </span>
                <span className="text-[16px] font-bold text-[#131b2e] leading-none">
                  {emailParam ? "Email Verification" : "Phone Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-8">
        <div className="flex flex-col w-full max-w-[440px] mx-auto px-4">
          <div className="w-full rounded-2xl border border-[#c2c6d7]/40 bg-white p-6 shadow-sm mt-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#e8f1ff] text-[#0055c4] mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px]">{emailParam ? "mail" : "phone_iphone"}</span>
            </div>

            <div className="text-center mb-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0055c4]">
                Secure verification
              </p>
              <h1 className="mt-2 text-[24px] font-bold text-[#131b2e] tracking-tight">
                Enter the 6-digit code
              </h1>
            </div>

            <p className="text-[14px] text-[#424655] leading-relaxed text-center">
              {emailParam ? `We sent a verification code to ${emailParam}.` : `We sent a verification code to ${phoneParam || "your mobile number"}.`}
            </p>

            {debugCode && (
              <div className="mt-4 rounded-xl border border-dashed border-[#0055c4]/30 bg-[#f2f3ff] px-3 py-2 text-center text-[13px] font-semibold text-[#0055c4]">
                Local test code: {debugCode}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-[12px] font-semibold text-[#131b2e]" htmlFor="otpCode">
                One-time password
              </label>
              <input
                id="otpCode"
                className="w-full h-[52px] rounded-xl border border-[#c2c6d7]/40 bg-white px-3 text-center text-[24px] tracking-[0.5em] font-semibold text-[#131b2e] outline-none focus:border-[#0055c4] focus:ring-1 focus:ring-[#0055c4]"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                value={code}
              />
            </div>

            <div className="mt-5 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff] p-3 text-[13px] text-[#131b2e]">
              {status}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                className="w-full h-12 rounded-xl bg-[#0055c4] text-white text-[16px] font-semibold shadow-sm hover:bg-[#1759c4] active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                disabled={verifyOtpMutation.isPending || !phoneParam || code.length !== 6}
                onClick={handleVerify}
                type="button"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify & continue"}
              </button>

              <button
                className="w-full h-11 rounded-xl bg-[#eef1ff] text-[#131b2e] text-[14px] font-semibold hover:bg-[#e3e8ff] transition-colors disabled:opacity-60"
                disabled={sendOtpMutation.isPending}
                onClick={() => void requestOtp()}
                type="button"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PatientVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">Loading verification status...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

