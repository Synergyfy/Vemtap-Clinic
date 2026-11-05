"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ClinicDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeBranch, setActiveBranch] = useState("Victoria Island Hub");
  const [restocked, setRestocked] = useState(false);

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-16">
      {/* Main Dashboard Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Operational Date Sub-bar & Primary Check-In */}
          <section className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-on-surface">Mon, 18 Nov 2024</span>
                  <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.2 rounded-full font-semibold">
                    W47
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span className="text-xs text-tertiary font-bold">Operational</span>
                  <span className="text-outline-variant text-xs">·</span>
                  <span className="text-xs text-on-surface-variant">{activeBranch}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/reception/check-in"
                  className="h-7 sm:h-8 px-2.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-secondary text-on-primary text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px]">person_add</span>
                  <span>+ Check-In</span>
                </Link>
                <Link
                  href="/clinic/queue"
                  className="h-7 sm:h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px]">schedule</span>
                  <span>Live Queue</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Metrics (4 Cards Across on Desktop) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Registered Today */}
            <div className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Registered</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">badge</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-2xl font-black text-on-surface">38</span>
                  <span className="text-[10px] text-tertiary font-bold">+12%</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">
                  Target: 45 patients
                </p>
              </div>
            </div>

            {/* Waiting in Lounge */}
            <div className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">In Lounge</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-2xl font-black text-on-surface">7</span>
                  <span className="bg-error-container text-on-error-container text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    1 Urgent
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">Avg wait: 14m</p>
              </div>
            </div>

            {/* Consultations */}
            <div className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Consultations</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-2xl font-black text-on-surface">24</span>
                  <span className="text-[9px] text-on-surface-variant font-bold bg-surface-container px-1.5 py-0.2 rounded-full">
                    Done
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5 truncate">
                  6 in session
                </p>
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Today's Total</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">payments</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-2xl font-black text-on-surface">₦1.85M</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant text-[10px] sm:text-[11px] mt-0.5 font-semibold">
                  <span className="text-primary font-bold">HMO 66%</span>
                  <span>Cash 34%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Middle Row: Payer Distribution & Optical Lab Pipeline (50/50 on Desktop) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Payer Breakdown */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[17px]">
                    health_and_safety
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-on-surface">Payer Distribution</h2>
                </div>
                <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-semibold">
                  AXA · Reliance · Hygeia
                </span>
              </div>

              {/* Ratio Bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: "64%" }} />
                  <div className="bg-secondary-container h-full transition-all duration-500" style={{ width: "36%" }} />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-primary flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    64% HMO (₦1.22M)
                  </span>
                  <span className="text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary-container inline-block"></span>
                    36% Private (₦625K)
                  </span>
                </div>
              </div>
            </div>

            {/* Optical Lab Pipeline */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[17px]">
                    eyeglasses
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-on-surface">Optical Lab Pipeline</h2>
                </div>
                <span className="bg-surface-container px-2 py-0.5 rounded-full text-on-surface font-bold text-[10px]">
                  14 Active Jobs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-container-low rounded-lg p-2 text-center flex flex-col justify-center border border-surface-container">
                  <span className="text-[10px] text-on-surface-variant font-medium">Surfacing</span>
                  <span className="text-sm sm:text-base font-black text-on-surface mt-0.5">4</span>
                  <span className="text-[9px] text-outline mt-0.5">Lathe / Polish</span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2 text-center flex flex-col justify-center border border-surface-container">
                  <span className="text-[10px] text-on-surface-variant font-medium">Verification</span>
                  <span className="text-sm sm:text-base font-black text-on-surface mt-0.5">5</span>
                  <span className="text-[9px] text-outline mt-0.5">Lensometry</span>
                </div>
                <div className="bg-surface-container-high rounded-lg p-2 text-center flex flex-col justify-center text-tertiary border border-tertiary/20">
                  <span className="text-[10px] text-tertiary font-bold">Ready</span>
                  <span className="text-sm sm:text-base font-black mt-0.5 text-tertiary">5</span>
                  <span className="text-[9px] text-tertiary mt-0.5 font-semibold">SMS Sent</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Section: Split 2 Columns on Desktop */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
            {/* Left Column (7 cols): Live Patient Flow & Equipment Alerts */}
            <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
              {/* Live Patient Flow */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[17px]">
                      transfer_within_a_station
                    </span>
                    <h2 className="text-xs sm:text-sm font-bold text-on-surface">Live Patient Flow</h2>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">Real-time status</span>
                </div>

                <div className="space-y-2">
                  {/* Urgent Triage Card (Emergency emphasis) */}
                  <div className="bg-error-container text-on-error-container rounded-lg p-2.5 sm:p-3 shadow-xs border border-error/20 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-error text-on-error text-[9px] px-2 py-0.2 rounded-full flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-[12px]">warning</span> URGENT TRIAGE
                          </span>
                          <span className="text-[10px] text-error font-bold">11:20 AM</span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold pt-0.5 text-on-error-container">
                          Miss Kanyinsola Adeleke
                        </div>
                        <div className="text-[11px] font-medium text-on-error-container/90">
                          VI-2024-8933 · Corneal Foreign Body (Left Eye)
                        </div>
                      </div>
                      <div className="bg-surface-container-lowest text-error px-2 py-1 rounded-md text-[10px] font-bold shadow-xs shrink-0">
                        Vitals Bay
                      </div>
                    </div>
                  </div>

                  {/* In Consultation Card */}
                  <div className="bg-surface-container-low rounded-lg p-2.5 shadow-xs border border-surface-container flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface truncate">
                          Engr. Babatunde Adeleke
                        </span>
                        <span className="text-on-surface-variant text-[11px]">· VI-2024-8841</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        Dr. Okafor · Comprehensive Glaucoma Review
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="bg-surface-container text-primary text-[10px] px-2 py-0.2 rounded-full font-bold">
                        Room 2
                      </span>
                      <span className="text-outline mt-0.5 text-[9px]">11:42 AM</span>
                    </div>
                  </div>

                  {/* Dilating Station Card */}
                  <div className="bg-surface-container-low rounded-lg p-2.5 shadow-xs border border-surface-container flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface truncate">
                          Mrs. Oluremi Ogundipe
                        </span>
                        <span className="text-on-surface-variant text-[11px]">· VI-2024-8902</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        Mydriasis drop admin (Tropicamide 1%)
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.2 rounded-full font-bold">
                        Dilating Bay
                      </span>
                      <span className="text-outline mt-0.5 text-[9px]">11:35 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Urgent Alerts */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error text-[17px]">
                      notifications_active
                    </span>
                    <h2 className="text-xs sm:text-sm font-bold text-on-surface">Equipment & Pharmacy Alerts</h2>
                  </div>
                  <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.2 rounded-full font-bold">
                    2 Action Required
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Calibration Alert */}
                  <div className="bg-surface-container-low rounded-lg p-2.5 shadow-xs border border-surface-container flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">biotech</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">
                          Slit Lamp 2 Calibration
                        </span>
                        <span className="text-outline text-[10px]">Tomorrow 09:00</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Optovision Biomedical scheduled for diagnostic recalibration.
                      </p>
                    </div>
                  </div>

                  {/* Low Dispensary Inventory */}
                  <div className="bg-surface-container-low rounded-lg p-2.5 shadow-xs border border-surface-container flex items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">medication</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-on-surface truncate">
                          Low Dispensary Inventory
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          Ciprofloxacin 0.3% Eye Drops
                        </p>
                        <span className="text-error font-bold text-[10px]">
                          {restocked ? "15 units restocked" : "4 units remaining"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRestocked(true)}
                      className="h-7 px-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-bold shadow-xs shrink-0 transition-transform active:scale-95 text-[11px]"
                    >
                      {restocked ? "Restocked ✓" : "Restock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Staff on Duty Roster */}
            <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-on-surface">Staff on Duty</h2>
                  <span className="text-[11px] text-primary font-bold">VI Hub Roster</span>
                </div>

                <div className="space-y-2">
                  {/* Dr. Amara Okafor */}
                  <div className="bg-surface-container-low rounded-lg p-2 shadow-xs border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container border border-surface-container-high">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEXcHmhw_TXs1PxYtcYUG5olnLMgo5Ty_Vt06Z4lYkEUHgTIdWGzP8soUW_eRsjvpqIJvmr-_TQXOlfj_HX85BuAJuMNNA8Y_sIpZzZlQb0lGb48FPxmZylZkHTpuayMP6TmxD2b0FKJLj846RAoTpczC8o2jMkEYeLfhueijJyp7m2lqv2fPQl_4ShcnIf2cbtnkblfgNv7oqkzQK_pMloSJCCTf7-i8R-r6r7uox"
                          alt="Dr. Amara Okafor"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-secondary ring-1 ring-surface-container-lowest"></span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-on-surface truncate">
                          Dr. Amara Okafor
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          Consultant Optometrist
                        </div>
                      </div>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                      Exam Rm 1 · In Session
                    </span>
                  </div>

                  {/* Dr. Babatunde Jinadu */}
                  <div className="bg-surface-container-low rounded-lg p-2 shadow-xs border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container border border-surface-container-high">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Cy0eTwyFLyUG5jUjYkrlEN6XiZd49Pql_29yBjyvW7WDVXmwejp5iUzCTFlLHrkyCEcPWW3NbGU8Ufv-xNIAuCXRt8hdBQ8lcIZmsQonnoiQ6bZd8aGSxTRBaF-6u6Qg83Lyr24soGzKGqF7Dgq0T5fgOUrejA_i0AvB2iYr3QqNLvxLQwmyqDJLDixXdF4qt90ay1HoqEt4_amM-IPQ_UeDAOmggK5UWdGTerXS"
                          alt="Dr. Babatunde Jinadu"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-secondary ring-1 ring-surface-container-lowest"></span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-on-surface truncate">
                          Dr. Babatunde Jinadu
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          Refraction Specialist
                        </div>
                      </div>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                      Refraction 2 · In Session
                    </span>
                  </div>

                  {/* Nurse Folake Ade */}
                  <div className="bg-surface-container-low rounded-lg p-2 shadow-xs border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container border border-surface-container-high">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7q6dH6m5nSDpUHVfphNjEtZw4FN-C74CPP8VwB9hVVpkbSCsos3aDO3N8Hpimd2kic7YXd9Wg0f2XXUXzX_Oo0nZ6OYRb0A6Yfsr23GSs07zs85ePe_f3Q-mkJq1a8zgLFZL80GGsrH6J5BAnlQdnvB3hHVKDG8u_ap4PHAcp8gn5DmxcEzoZ5HcJHEGkea4VLnCWvCuUr2XxKw4OhwwbqqAEoSu-GEY7CzDNimvI"
                          alt="Nurse Folake Ade"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-tertiary ring-1 ring-surface-container-lowest"></span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-on-surface truncate">
                          Nurse Folake Ade
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          Ophthalmic Triage Lead
                        </div>
                      </div>
                    </div>
                    <span className="bg-surface-container-high text-tertiary text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold">
                      Triage Bay · Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Quick Links */}
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-on-surface">Quick Station Navigation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/clinic/patients"
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container flex items-center gap-2 transition-colors text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-primary text-[17px]">groups</span>
                    <span>Patient Directory</span>
                  </Link>
                  <Link
                    href="/reception/documents/ocr"
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container flex items-center gap-2 transition-colors text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-primary text-[17px]">
                      document_scanner
                    </span>
                    <span>OCR Scanner</span>
                  </Link>
                  <Link
                    href="/clinic/optical"
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container flex items-center gap-2 transition-colors text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-secondary text-[17px]">
                      eyeglasses
                    </span>
                    <span>Optical Lab</span>
                  </Link>
                  <Link
                    href="/clinic/clinical-reporting"
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container flex items-center gap-2 transition-colors text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[17px]">
                      analytics
                    </span>
                    <span>Reporting</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
