"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type ActiveTab = "baseline" | "prescriptions" | "scans" | "billing";

export default function ClinicalPatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("baseline");
  const [copiedId, setCopiedId] = useState(false);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText("VEM-88219");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-16">
      {/* Main Container */}
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

        {/* Two-Column Responsive Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Left Column (4 cols on lg): Hero Card, Contact, HMO, Family, Emergency */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 sm:gap-3">
            {/* Patient Hero Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                {/* Patient Initials Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                  OA
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h2 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                      Olumide Adeleke
                    </h2>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                      Active Care
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Male, 34 yrs • 14 Mar 1990
                  </p>

                  {/* Identifier Codes */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-low text-primary text-[10px] font-mono hover:bg-surface-container transition-colors border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[11px]">tag</span>
                      <span className="font-bold">
                        {copiedId ? "Copied!" : "#VEM-88219"}
                      </span>
                      <span className="material-symbols-outlined text-[10px] text-outline">
                        content_copy
                      </span>
                    </button>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] border border-surface-container">
                      #VMT-1042
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-error-container text-on-error-container font-bold text-[10px]">
                      O+
                    </span>
                  </div>
                </div>
              </div>

              {/* HMO Verification Pill Box */}
              <div className="bg-surface-container-low rounded-lg p-2 flex items-center gap-2 border border-surface-container">
                <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface font-bold truncate">HMO Tier-1 Verified</p>
                  <p className="text-[10px] text-on-surface-variant truncate">
                    AXA Mansard • #AXA-NG-99214
                  </p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
              </div>

              {/* Direct Contact & Family */}
              <div className="pt-1.5 flex flex-col gap-1.5 border-t border-surface-container">
                <div className="flex items-center justify-between text-on-surface-variant text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[14px] text-primary">phone</span>
                    <a
                      href="tel:+2348031234567"
                      className="hover:text-primary transition-colors text-on-surface font-semibold"
                    >
                      +234 803 123 4567
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant truncate text-[11px]">
                    <span className="material-symbols-outlined text-[13px] text-outline">
                      alternate_email
                    </span>
                    <span className="truncate">olumide.adeleke@email.ng</span>
                  </div>
                </div>

                {/* Linked Family Members Chip */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-surface-container text-on-surface border border-surface-container-high">
                  <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">
                    diversity_1
                  </span>
                  <span className="text-[11px] truncate">
                    <strong>2 Linked:</strong> Tiwa (Daughter, 8y), Funke (Spouse)
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-outline ml-auto">
                    chevron_right
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons Row */}
              <div className="grid grid-cols-12 gap-1.5 pt-1.5 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => router.push(`/clinic/appointments`)}
                  className="col-span-6 h-8 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-primary-hover active:bg-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  <span>New Consult</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/reception/appointments`)}
                  className="col-span-3 h-8 bg-surface-container text-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
                  <span>Book</span>
                </button>
                <a
                  href="tel:+2348031234567"
                  className="col-span-3 h-8 bg-surface-container text-on-surface rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Emergency Contact Module */}
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-surface-container flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-error text-[16px]">
                    contact_emergency
                  </span>
                  <h3 className="text-xs font-bold text-on-surface">Emergency Contact</h3>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container font-bold text-[9px]">
                  Next of Kin
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-[10px] shrink-0">
                    FA
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-on-surface font-bold truncate">Funke Adeleke</p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      Spouse • Victoria Island, Lagos
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+2348029876543"
                  className="h-7 px-2.5 rounded-md bg-surface-container text-primary text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols on lg): Tabs & Detailed Records */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Horizontal Sub-nav Tabs */}
            <div className="bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-surface-container flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("baseline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTab === "baseline"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">vital_signs</span>
                <span>Clinical Baseline</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("prescriptions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "prescriptions"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                Prescriptions (4)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("scans")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "scans"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                Timeline & Scans
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("billing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === "billing"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                Billing & HMO
              </button>
            </div>

            {/* TAB CONTENT: Clinical Baseline */}
            <div className="flex flex-col gap-3">
              {/* Refraction Baseline Rx Card */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[17px]">
                      visibility
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-on-surface">Refraction Baseline</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-[10px]">
                    Active Rx
                  </span>
                </div>

                {/* Specialty Ophthalmic Matrix */}
                <div className="rounded-lg bg-surface-container-low overflow-hidden border border-surface-container">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 text-center text-[10px] text-on-surface-variant py-1.5 bg-surface-container font-bold uppercase tracking-wider">
                    <div className="text-left pl-3">Eye</div>
                    <div>SPH</div>
                    <div>CYL</div>
                    <div>AXIS</div>
                    <div>ADD</div>
                  </div>
                  {/* OD (Right Eye) */}
                  <div className="grid grid-cols-5 text-center items-center py-2 text-xs text-on-surface bg-surface-container-lowest border-b border-surface-container-high">
                    <div className="text-left pl-3 font-bold text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      OD <span className="text-outline text-[10px]">(R)</span>
                    </div>
                    <div className="font-mono font-bold">-1.75</div>
                    <div className="font-mono font-bold">-0.50</div>
                    <div className="font-mono font-bold">180°</div>
                    <div className="font-mono text-outline">—</div>
                  </div>
                  {/* OS (Left Eye) */}
                  <div className="grid grid-cols-5 text-center items-center py-2 text-xs text-on-surface bg-surface-container-low">
                    <div className="text-left pl-3 font-bold text-secondary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                      OS <span className="text-outline text-[10px]">(L)</span>
                    </div>
                    <div className="font-mono font-bold">-2.00</div>
                    <div className="font-mono font-bold">-0.25</div>
                    <div className="font-mono font-bold">175°</div>
                    <div className="font-mono font-bold text-tertiary">+1.00</div>
                  </div>
                </div>

                {/* Pupillary Distance & Attending Consultant Footnote */}
                <div className="flex items-center justify-between pt-0.5 text-on-surface-variant text-[11px]">
                  <span className="flex items-center gap-1">
                    <strong className="text-on-surface font-bold">PD:</strong> 63.5 mm (Binocular)
                  </span>
                  <span className="text-right truncate ml-2">
                    Dr. Amara Okafor <span className="text-outline">• 24 Oct 24</span>
                  </span>
                </div>
              </div>

              {/* Tonometry (IOP) & Diagnostic Vitals Card */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[17px]">speed</span>
                    <h3 className="text-xs sm:text-sm font-bold text-on-surface">Tonometry (IOP)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-bold text-[10px]">
                    Normotensive
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {/* OD Tonometry */}
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col justify-between border border-surface-container">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        OD (Right Eye)
                      </span>
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    </div>
                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-base sm:text-xl font-black text-on-surface">14</span>
                      <span className="text-[10px] text-outline font-semibold">mmHg</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div className="bg-tertiary h-1.5 rounded-full w-[45%]"></div>
                    </div>
                    <span className="text-tertiary font-semibold mt-1 text-[10px]">
                      Optimal Range (10-21)
                    </span>
                  </div>

                  {/* OS Tonometry */}
                  <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col justify-between border border-surface-container">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        OS (Left Eye)
                      </span>
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    </div>
                    <div className="my-1 flex items-baseline gap-1">
                      <span className="text-base sm:text-xl font-black text-on-surface">15</span>
                      <span className="text-[10px] text-outline font-semibold">mmHg</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div className="bg-tertiary h-1.5 rounded-full w-[50%]"></div>
                    </div>
                    <span className="text-tertiary font-semibold mt-1 text-[10px]">
                      Optimal Range (10-21)
                    </span>
                  </div>
                </div>

                {/* Known Conditions / Diagnostic Flags */}
                <div className="pt-2">
                  <p className="font-label-sm text-on-surface-variant font-bold mb-2.5">
                    Diagnostic Flags & Findings:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm font-semibold flex items-center gap-1.5 border border-surface-container-high">
                      <span className="material-symbols-outlined text-[15px] text-secondary">
                        adjust
                      </span>
                      Myopic Astigmatism
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm font-semibold flex items-center gap-1.5 border border-surface-container-high">
                      <span className="material-symbols-outlined text-[15px] text-secondary">
                        menu_book
                      </span>
                      Early Presbyopia (OD/OS)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm font-bold flex items-center gap-1.5 border border-tertiary/20">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">
                        health_and_safety
                      </span>
                      Glaucoma Screen Negative
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Diagnostic Imagery & Scans */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      upload_file
                    </span>
                    <h3 className="font-headline-sm text-on-surface font-bold">
                      Recent Scans & Ophthalmic Imaging
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="text-primary font-label-sm font-bold hover:underline"
                  >
                    All (6)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scan Card 1: Retinal Tomography OCT */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3.5 border border-surface-container">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container border border-surface-container-high">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl7ksk_pRan5oRlNPIaAJBRa7evdDZWpqIbrATCejqKsJW_3WvMNj2c8H3c4jmDxvAbnm-uCKZtC4dwqtbp92QxyY6niSYkztAdZ7WEyXuVNqrRXf9FWKZD1t9Tl42RBtbGnvm2nJI5xCQdkBmtm6tCvhV-kspPB_AyFypQmsb2E21nlK6OLyZ0OFKkoa4CLLH3U0lEDq3ZN0qaLBWI4HOMHB2WRtAkM-KnMyOvEFg"
                        alt="Retinal OCT Scan"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white font-label-sm text-[10px] font-bold">
                        OCT
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-on-surface font-bold truncate">
                          Retinal OCT • Macula
                        </span>
                        <span className="font-label-sm text-tertiary font-bold text-xs">Normal</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant text-[12px] mt-0.5">
                        Thickness: 245 µm • Foveal pit intact
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-body-sm text-[11px] text-outline">24 Oct 2024 · VI</span>
                        <button
                          type="button"
                          onClick={() => setSelectedScan("Retinal OCT Macula")}
                          className="inline-flex items-center gap-1 text-primary font-label-sm font-bold hover:underline text-xs"
                        >
                          <span>View Scan</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scan Card 2: Anterior Chamber Slit-Lamp Photography */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3.5 border border-surface-container">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container border border-surface-container-high">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUlo1BaKq_CTjDBdepHEFCo3ksu9HXqOUamqZJAVv9lQBWIu_T9LUSIfq6oETUbH0NhWZ0qGYdzgfh838xnNmUn3ln27FVH5fYS009jk5kWmQ5o4LsjIA8LOHq4lALbprzZOGGBc89giBCVcNpxEICpBGIl_VTER-I6bteGIVKk1soZ5HXBJyk8HDfYsY-QfxtlXK-2F77qgqCac5gWiBzkfp5kmd8Nm0RjonqOQqz"
                        alt="Slit Lamp Anterior Chamber"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white font-label-sm text-[10px] font-bold">
                        SLIT
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-on-surface font-bold truncate">
                          Anterior Chamber Angle
                        </span>
                        <span className="font-label-sm text-primary font-bold text-xs">Gr. 4</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant text-[12px] mt-0.5">
                        Van Herick Grade 4 • Deep angle
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-body-sm text-[11px] text-outline">
                          24 Oct 2024 · Dr. Okafor
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedScan("Anterior Chamber Angle")}
                          className="inline-flex items-center gap-1 text-primary font-label-sm font-bold hover:underline text-xs"
                        >
                          <span>High-Res</span>
                          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Longitudinal Clinical Encounter Timeline */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      history
                    </span>
                    <h3 className="font-headline-sm text-on-surface font-bold">Encounter Timeline</h3>
                  </div>
                  <span className="font-label-sm text-outline">Victoria Island Branch</span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Entry 1 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <span className="material-symbols-outlined text-[19px]">eyeglasses</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-label-md text-on-surface font-bold">
                          Optical Lens Dispensing & Frame Fitting
                        </h4>
                        <p className="font-body-sm text-on-surface-variant text-[13px] mt-0.5">
                          Zeiss DuraVision BlueProtect • Silhouette Urban Titan
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm font-bold text-[11px]">
                            Dispensed
                          </span>
                          <span className="font-body-sm text-outline text-[12px]">
                            28 Oct 2024 • Opt. T. Balogun
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Details"
                      className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>

                  {/* Entry 2 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <span className="material-symbols-outlined text-[19px]">medical_services</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-label-md text-on-surface font-bold">
                          Comprehensive Retinal Exam & Tonometry
                        </h4>
                        <p className="font-body-sm text-on-surface-variant text-[13px] mt-0.5">
                          Dilated funduscopy, Goldmann tonometry, autorefraction
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm font-bold text-[11px]">
                            Consultant Review
                          </span>
                          <span className="font-body-sm text-outline text-[12px]">
                            24 Oct 2024 • Dr. Amara Okafor
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Details"
                      className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* High-Resolution Scan Modal Preview */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-surface-container-high">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  visibility
                </span>
                <h3 className="font-headline-sm font-bold">{selectedScan}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="w-full aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={
                  selectedScan.includes("OCT")
                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCl7ksk_pRan5oRlNPIaAJBRa7evdDZWpqIbrATCejqKsJW_3WvMNj2c8H3c4jmDxvAbnm-uCKZtC4dwqtbp92QxyY6niSYkztAdZ7WEyXuVNqrRXf9FWKZD1t9Tl42RBtbGnvm2nJI5xCQdkBmtm6tCvhV-kspPB_AyFypQmsb2E21nlK6OLyZ0OFKkoa4CLLH3U0lEDq3ZN0qaLBWI4HOMHB2WRtAkM-KnMyOvEFg"
                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuCUlo1BaKq_CTjDBdepHEFCo3ksu9HXqOUamqZJAVv9lQBWIu_T9LUSIfq6oETUbH0NhWZ0qGYdzgfh838xnNmUn3ln27FVH5fYS009jk5kWmQ5o4LsjIA8LOHq4lALbprzZOGGBc89giBCVcNpxEICpBGIl_VTER-I6bteGIVKk1soZ5HXBJyk8HDfYsY-QfxtlXK-2F77qgqCac5gWiBzkfp5kmd8Nm0RjonqOQqz"
                }
                alt="High-Res Diagnostic Scan"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span>RESOLUTION: 2048 x 1536 · DICOM COMPLIANT</span>
              <span>PATIENT: OLUMIDE ADELEKE (#VEM-88219)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
