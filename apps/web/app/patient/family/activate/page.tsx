"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { patientPortalService } from "@/services/patient-portal.service";

const monthOptions = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

export default function FamilyActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [dobYear, setDobYear] = useState("2015");
  const [dobMonth, setDobMonth] = useState("04");
  const [dobDay, setDobDay] = useState("12");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dob = useMemo(() => `${dobYear}-${dobMonth}-${dobDay}`, [dobYear, dobMonth, dobDay]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("The activation link is missing. Ask the guardian to resend it.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter the family member's full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter them.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await patientPortalService.activateFamilyMember({
        token,
        fullName: fullName.trim(),
        dateOfBirth: dob,
        gender,
        phone,
        password,
      });

      router.push("/patient/login");
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || submitError?.message || "Unable to activate this account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6ff] px-4 py-8 text-[#131b2e]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#dfe6ff] bg-white p-6 shadow-[0_12px_40px_rgba(12,38,70,0.06)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8efff] text-[#0055c4]">
            <span className="material-symbols-outlined text-[28px]">person_add</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0055c4]">Independent access</p>
            <h1 className="text-2xl font-bold">Activate family member account</h1>
          </div>
        </div>

        <p className="mb-6 rounded-xl bg-[#f2f3ff] px-4 py-3 text-sm text-[#424655]">
          This account is separate from the guardian login. Once activated, the family member can sign in with their own email and password.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Full name</label>
            <input
              className="h-11 w-full rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-3.5 outline-none transition focus:border-[#0055c4] focus:bg-white"
              placeholder="e.g. Sam Doe"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Phone number</label>
            <input
              className="h-11 w-full rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-3.5 outline-none transition focus:border-[#0055c4] focus:bg-white"
              placeholder="+2348000000001"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Date of birth</label>
            <div className="grid grid-cols-3 gap-2.5">
              <select className="h-11 rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-2 text-sm outline-none focus:border-[#0055c4]" value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                {dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
              <select className="h-11 rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-2 text-sm outline-none focus:border-[#0055c4]" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                {monthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
              </select>
              <select className="h-11 rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-2 text-sm outline-none focus:border-[#0055c4]" value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                {Array.from({ length: 60 }, (_, index) => String(2026 - index)).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Gender</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["male", "female", "other"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    gender === option ? "border-[#0055c4] bg-[#0055c4] text-white" : "border-[#dfe6ff] bg-[#f7f9ff] text-[#131b2e]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Create password</label>
            <input
              className="h-11 w-full rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-3.5 outline-none transition focus:border-[#0055c4] focus:bg-white"
              placeholder="Minimum 6 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#424655]">Confirm password</label>
            <input
              className="h-11 w-full rounded-xl border border-[#dfe6ff] bg-[#f7f9ff] px-3.5 outline-none transition focus:border-[#0055c4] focus:bg-white"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-[#0055c4] text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Activating account..." : "Create my independent account"}
          </button>
        </form>
      </div>
    </div>
  );
}
