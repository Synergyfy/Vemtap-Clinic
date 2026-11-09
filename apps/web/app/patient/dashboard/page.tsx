"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();

  const [checkedIn, setCheckedIn] = useState(false);
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    showToast("Checked in successfully for your assigned clinic queue.");
  };

  const handleMedication = () => {
    setMedicationTaken(true);
    showToast("Recorded: Travatan Eye Drop taken for today.");
  };

  return (
    <div className="w-full text-[#0F2942] antialiased selection:bg-blue-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-[#0F2942] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── PATIENT GREETING & PATIENT ID HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-[#E9F1F7]/70 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)]">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-[#73889B] uppercase">Welcome Back</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2942] leading-tight mt-0.5">
            Good morning, Patient
          </h1>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F9FD] rounded-full border border-[#E2EBF2] shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs font-bold text-[#0F2942] font-mono tracking-tight">Patient profile</span>
            <span className="text-[11px] text-[#73889B] font-medium">• Active</span>
          </div>
          <Link
            href="/patient/select-profile"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#EBF4FE] hover:bg-[#D9E2FF] text-[#0055C4] rounded-full text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">switch_account</span>
            <span>Switch Profile</span>
          </Link>
        </div>
      </div>

      {/* ── RESPONSIVE GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* ── LEFT / MAIN COLUMN (lg:col-span-8) ── */}
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          {/* SECTION: UPCOMING APPOINTMENTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-[#0F2942]">
                Upcoming Appointments
              </h2>
              <span className="text-[11px] font-bold text-[#0055C4] bg-[#E6F4FE] px-2.5 py-0.5 rounded-full">
                {checkedIn ? "Checked In • Queue #4" : "Confirmed"}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 transition-all hover:shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#EDF5FF] overflow-hidden shrink-0 ring-2 ring-[#F2F7FC] flex items-center justify-center">
                    <img
                      alt="Assigned clinician"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrK6DGWwAfn32_QM8kIrMOQMTBol-UdD-8nJ1Ij6zGD0XCPrRKIJTMc-1NeOOxRO7_5L8HG4v7SRpc2rBZrycjjRkd8E5h00M5j6js1UAtkaUGohmglGnxKKMghL4umFOXeSN5ljqYEU0tp67633fLne582UWIF8iF_wfQ2BD4B1h99TeOyb6aD9WXar4ix9E6AKdWGLNFdEgkM_vsxmkrtdzEK6mqOUk03bVkby3_"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-bold text-[#0F2942] truncate leading-snug">
                      Assigned Clinician
                    </h3>
                    <p className="text-[12px] font-bold text-[#0055C4] truncate">
                      Consultant Retinal Specialist
                    </p>
                    <p className="text-[12px] font-medium text-[#73889B] truncate mt-0.5">
                      Dilated Examination &amp; Retinal OCT Scan
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 text-xs text-[#73889B]">
                  <div className="flex items-center gap-1 font-semibold text-[#0F2942]">
                    <span className="material-symbols-outlined text-[16px] text-[#0055C4]">calendar_today</span>
                    <span>Next Mon, Nov 18</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium mt-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>10:30 AM WAT</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center gap-2.5">
                <Link
                  className="w-full sm:w-auto sm:px-6 py-2 rounded-xl bg-[#F0F6FD] hover:bg-[#E2EFFC] text-[#0055C4] text-[12px] font-bold text-center transition-colors"
                  href="/patient/appointments"
                >
                  View Details
                </Link>
                <button
                  className={`w-full sm:flex-1 py-2 rounded-xl text-white text-[12px] font-bold text-center transition-colors shadow-sm cursor-pointer ${
                    checkedIn ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#0055C4] hover:bg-[#0047A6]"
                  }`}
                  onClick={handleCheckIn}
                  type="button"
                >
                  {checkedIn ? "✓ You are in line (Desk 3)" : "Directions & Check In"}
                </button>
              </div>
            </div>
          </div>

          {/* SOFT PASTEL QUICK ACCESS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              className="bg-[#FFF1F3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:opacity-95 transition-all"
              href="/patient/records"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-[14px] font-bold text-[#E11D48] whitespace-nowrap truncate">
                    Medical analysis
                  </h3>
                  <span className="material-symbols-outlined text-[18px] text-[#E11D48] shrink-0">folder_shared</span>
                </div>
                <p className="text-[12px] text-[#E11D48]/85 font-semibold mt-1">Retinal &amp; IOP Scans</p>
                <p className="text-[11px] text-[#E11D48]/70 mt-0.5">2 new test results available</p>
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="h-1.5 w-full bg-[#FDA4AF] rounded-full opacity-80"></div>
                <div className="h-1.5 w-3/5 bg-[#FDA4AF] rounded-full opacity-60"></div>
              </div>
            </Link>

            <Link
              className="bg-[#E6F4FE] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:opacity-95 transition-all"
              href="/patient/optical"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-[14px] font-bold text-[#0284C7] whitespace-nowrap truncate">
                    My prescriptions
                  </h3>
                  <span className="material-symbols-outlined text-[18px] text-[#0284C7] shrink-0">medication</span>
                </div>
                <p className="text-[12px] text-[#0284C7]/85 font-semibold mt-1">Blue-Cut • Travatan</p>
                <p className="text-[11px] text-[#0284C7]/70 mt-0.5">Rx active until Dec 2024</p>
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="h-1.5 w-full bg-[#7DD3FC] rounded-full opacity-80"></div>
                <div className="h-1.5 w-3/5 bg-[#7DD3FC] rounded-full opacity-60"></div>
              </div>
            </Link>
          </div>

          {/* OPTICAL LAB ORDER TRACKER */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F0F6FD] text-[#0055C4] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">eyeglasses</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F2942] truncate">
                    Titanium Flex Matte Black
                  </h3>
                  <p className="text-[12px] text-[#73889B] truncate">
                    Blue-Cut Precision Progressive • Lens Crafting
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-mono font-semibold text-[#73889B]">#ORD-2024-8841</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold shrink-0">
                  Step 3 of 4: Quality QC
                </span>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="pt-2 pb-1">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-4 right-4 top-3 -translate-y-1/2 h-1 bg-[#E2EBF2] z-0"></div>
                <div className="absolute left-4 w-2/3 top-3 -translate-y-1/2 h-1 bg-[#0055C4] z-0"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#0055C4] text-white flex items-center justify-center ring-2 ring-white shadow-sm">
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F2942] mt-1.5">Placed</span>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#0055C4] text-white flex items-center justify-center ring-2 ring-white shadow-sm">
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F2942] mt-1.5">In Lab</span>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#0055C4] text-white flex items-center justify-center ring-4 ring-[#E0EDFD] shadow-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0055C4] mt-1.5">Quality QC</span>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#E2EBF2] text-[#8DA0B3] flex items-center justify-center ring-2 ring-white">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  </div>
                  <span className="text-[10px] font-medium text-[#73889B] mt-1.5">Pickup</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
              <div className="flex items-center gap-1.5 text-[#0F2942] font-semibold truncate">
                <span className="material-symbols-outlined text-[16px] text-[#0055C4] shrink-0">storefront</span>
                <span>Ready for Victoria Island pickup • Est. Nov 20</span>
              </div>
              <Link className="text-[#0055C4] font-bold hover:underline shrink-0" href="/patient/optical">
                View Lab Details &amp; Invoice →
              </Link>
            </div>
          </div>

          {/* RECENT CLINICAL HISTORY */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-[#0F2942]">
                Recent Clinical History
              </h3>
              <Link className="text-[12px] font-bold text-[#0055C4] hover:underline" href="/patient/records">
                View All Records
              </Link>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              <div className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F1FC] text-[#0055C4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[19px]">medical_services</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-bold text-[#0F2942] truncate">Comprehensive Refraction</h4>
                    <p className="text-[11px] text-[#73889B] truncate">Dr. Babatunde Jinadu • Oct 14, 2024</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F0EEFD] text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[19px]">receipt_long</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-bold text-[#0F2942] truncate">Prescription Updated</h4>
                    <p className="text-[11px] text-[#73889B] truncate">OD: -1.75 / OS: -2.00 • Sep 22, 2024</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0F2942] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full shrink-0">
                  Archived
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT / SIDE COLUMN (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-5 lg:space-y-6">
          {/* SECONDARY QUICK ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF4FE] flex items-center justify-center text-[#0055C4] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-[#0F2942] truncate">Book Visit</h4>
                  <p className="text-[11px] text-[#73889B] truncate">Optical or Retina Specialist</p>
                </div>
              </div>
              <Link
                className="w-full py-2 rounded-xl bg-[#0055C4] text-white text-[12px] font-bold text-center hover:bg-[#0047A6] transition-colors block"
                href="/patient/appointments"
              >
                Book Consultation Now
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[14px] font-bold text-[#0F2942] truncate">HMO &amp; Billing</h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Active</span>
                  </div>
                  <p className="text-[11px] text-[#73889B] truncate">Insurance provider • active plan</p>
                </div>
              </div>
              <Link
                className="w-full py-2 rounded-xl bg-[#F0F6FD] text-[#0055C4] text-[12px] font-bold text-center hover:bg-[#E2EFFC] transition-colors block"
                href="/patient/billing"
              >
                View Invoices &amp; Claims
              </Link>
            </div>
          </div>

          {/* MEDICATION REFILL / REMINDER ALERT */}
          <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border border-amber-200/60 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-[14px] font-bold text-amber-950 truncate">Travatan Eye Drops</h4>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 shrink-0">
                  {medicationTaken ? "Taken" : "4 Days Left"}
                </span>
              </div>
              <p className="text-[12px] text-amber-900/90 mt-1 leading-snug">
                1 drop nightly in right eye. Refill approval ready at VI Clinic pharmacy.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  className="text-[12px] font-bold text-amber-900 underline hover:text-amber-950"
                  onClick={() => showToast("Clinic refill request submitted")}
                  type="button"
                >
                  Request Refill
                </button>
                <span className="text-amber-300">•</span>
                <button
                  className="text-[12px] font-semibold text-amber-800 hover:text-amber-900"
                  onClick={handleMedication}
                  type="button"
                >
                  {medicationTaken ? "✓ Marked as Taken" : "Mark as Taken"}
                </button>
              </div>
            </div>
          </div>

          {/* DAILY OCULAR WELLNESS TIP */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0055C4] text-[18px]">visibility</span>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0F2942]">
                  Daily Ocular Wellness
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#0055C4] bg-[#EBF4FE] px-2 py-0.5 rounded-full">
                Eye Strain Tip
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-[#0F2942] leading-snug">
              The 20-20-20 Rule for Digital Strain
            </h4>
            <p className="text-[12px] font-medium text-[#73889B] mt-1.5 leading-relaxed">
              Every 20 minutes spent looking at your screen, look at an object 20 feet away for at least 20 seconds to relax your ciliary eye muscles.
            </p>
          </div>

          {/* FAMILY PROFILE QUICK ACCESS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055C4] text-[20px]">family_restroom</span>
                <h4 className="text-[14px] font-bold text-[#0F2942]">Family Profiles</h4>
              </div>
              <span className="text-[11px] font-bold text-[#0055C4] bg-[#EBF4FE] px-2 py-0.5 rounded-full">
                2 Dependents
              </span>
            </div>
            <p className="text-[12px] text-[#73889B] mb-3">
              Manage linked family profiles and shared care records for dependents.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/patient/select-profile"
                className="flex-1 py-2 rounded-xl bg-[#F0F6FD] hover:bg-[#E2EFFC] text-[#0055C4] text-xs font-bold text-center transition-colors"
              >
                Switch Profile
              </Link>
              <Link
                href="/patient/family/add"
                className="flex-1 py-2 rounded-xl bg-[#0055C4] hover:bg-[#0047A6] text-white text-xs font-bold text-center transition-colors"
              >
                + Add Member
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
