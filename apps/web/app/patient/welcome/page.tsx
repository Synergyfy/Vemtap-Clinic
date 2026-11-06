"use client";

import React from "react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative w-full bg-[#faf8ff] min-h-screen font-[Inter,sans-serif] text-[#131b2e] antialiased selection:bg-[#0055c4]/20 py-8 px-4">
      <div className="flex flex-col w-full max-w-xl mx-auto">
        {/* ── Brand & Accreditation Header ── */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#066cf4] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[24px]">
                visibility
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-[#131b2e] tracking-tight">
                VEMTAP
              </span>
              <span className="text-[12px] font-bold text-[#0055c4] tracking-wider uppercase">
                Eye Clinic
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e2e7ff] text-[#424655]">
            <span
              className="material-symbols-outlined text-[#006847] text-[15px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-xs font-semibold tracking-normal">
              Accredited Eye Care Network • Lagos &amp; Abuja
            </span>
          </div>
        </div>

        {/* ── Hero Feature Graphic Card ── */}
        <div className="w-full rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-[#e2e7ff]/60 mb-5 relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#d9e2ff] text-[#001945] text-xs font-bold mb-2">
                Patient Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight leading-snug">
                Clearer vision, seamless care for the whole family.
              </h1>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#f2f3ff] flex items-center justify-center shrink-0 text-[#0055c4]">
              <span className="material-symbols-outlined text-[28px]">
                lens_blur
              </span>
            </div>
          </div>

          {/* Clinic preview image */}
          <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-sm">
            <img
              className="w-full h-full object-cover"
              alt="Modern ophthalmology examination room"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvbAI9DdTobC6UQvL-FLkXOkT8iO0nHmYHWolZ7LFY85ZU24Qo28f2PpQ0QugMI3RLUd-IjDU095PzvwJvwIEdwYQvXwtVha2kztsSv56lbVu8xlR7e0ZjLWlUKz47uvGWrE2IlJBdilvLUrzsXaXQ4aB6GGengYkjRdbJAEBPTY_Z7dsfCgtDDv-YwCwiJPMKTuLVxf5nsLs-795meqP12ZMC42Msv7Flh2yhm9lt"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/70 via-transparent to-transparent flex items-end p-3">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[18px] text-[#6ffbbe]">
                  health_and_safety
                </span>
                <span className="text-xs font-semibold">
                  Comprehensive Ophthalmic Diagnostics &amp; Patient Portal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Core Value Propositions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              icon: "folder_managed",
              title: "Unified Records",
              desc: "Access IOP scans, OCT & refraction histories across branches",
              bg: "bg-[#eaedff]",
              color: "text-[#0055c4]",
            },
            {
              icon: "eyeglasses",
              title: "Optical Lab",
              desc: "Real-time tracking of custom prescriptions & lens crafting",
              bg: "bg-[#e2e7ff]",
              color: "text-[#1759c4]",
            },
            {
              icon: "family_restroom",
              title: "Family & HMO",
              desc: "Manage dependents & verified insurance coverage",
              bg: "bg-[#dae2fd]",
              color: "text-[#006847]",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="flex sm:flex-col items-center sm:items-start p-3.5 rounded-xl bg-white border border-[#e2e7ff]/60 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center mr-3 sm:mr-0 sm:mb-2.5 shrink-0 ${v.color}`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {v.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#131b2e] truncate">
                  {v.title}
                </div>
                <div className="text-xs text-[#424655] mt-0.5 line-clamp-2">
                  {v.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Call-to-Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Link
            href="/patient/register"
            className="flex-1 h-12 bg-[#066cf4] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0055c4] active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Create New Patient Account</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/patient/login"
            className="flex-1 h-12 bg-[#f2f3ff] text-[#0055c4] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#eaedff] active:scale-[0.99] transition-all cursor-pointer border border-[#c2c6d7]/30"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span>I Already Have an Account</span>
          </Link>
        </div>

        {/* ── Clinic Walk-in QR Option ── */}
        <div className="w-full p-3.5 rounded-xl bg-white border border-[#e2e7ff]/60 shadow-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-[#d9e2ff] flex items-center justify-center shrink-0 text-[#001945]">
              <span className="material-symbols-outlined text-[20px]">
                qr_code_scanner
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#131b2e] truncate">
                Visiting a clinic today?
              </div>
              <div className="text-xs text-[#424655] truncate">
                Fast kiosk check-in with branch code
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-[#e2e7ff] text-[#0055c4] text-xs font-bold shrink-0 hover:bg-[#dae2fd] transition-colors flex items-center gap-1 cursor-pointer">
            <span>Scan QR</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
          </button>
        </div>

        {/* ── Legal & Privacy Footer ── */}
        <div className="text-center px-2">
          <p className="text-xs text-[#424655]">
            By continuing, you agree to VEMTAP&apos;s{" "}
            <Link
              href="#"
              className="text-[#0055c4] font-semibold hover:underline"
            >
              Patient Privacy Policy
            </Link>{" "}
            &amp;{" "}
            <Link
              href="#"
              className="text-[#0055c4] font-semibold hover:underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
