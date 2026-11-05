"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useAuth } from "@/lib/auth-context";

type VisitPurpose =
  | "consultation"
  | "refraction"
  | "lens_purchase"
  | "frame_selection"
  | "pickup"
  | "follow_up";

type PriorityLevel = "standard" | "senior" | "urgent";

export default function ReceptionCheckInPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("Olumide Adeleke");
  const [selectedPurpose, setSelectedPurpose] = useState<VisitPurpose>("consultation");
  const [priority, setPriority] = useState<PriorityLevel>("standard");
  const [billingMode, setBillingMode] = useState<"hmo" | "cash">("hmo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  const handleCheckIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCheckedIn(true);
      setShowSlipModal(true);
    }, 900);
  };

  const handleEmergencyBypass = () => {
    setEmergencyAlertActive(true);
    setTimeout(() => {
      setEmergencyAlertActive(false);
      alert("🚨 PRIORITY CODE RED: Immediate bypass routed to Exam Room 1 (Dr. Amara Okafor). Patient priority set to STAT URGENT.");
      setPriority("urgent");
    }, 400);
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-12">
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top Sub-Header & Live Clinic Pulse Banner */}
          <div className="bg-surface-container-low rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">
                  Desk 02 · Front Office VI
                </span>
                <span className="px-2 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-semibold">
                  Shift: Morning (08:00 - 14:00)
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-0.5">
                <h2 className="text-xs sm:text-sm font-bold text-on-surface">Reception Intake & Routing</h2>
                <span className="text-[11px] text-on-surface-variant hidden sm:inline">Live triage & queue sync</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-xs border border-surface-container flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-primary font-bold">42 / 58</div>
                  <div className="text-[9px] text-on-surface-variant">Intake Today</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-xs border border-surface-container flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined text-[15px]">timer</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-tertiary font-bold">11 min</div>
                  <div className="text-[9px] text-outline">Avg Wait</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Responsive Grid on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
            {/* Left Column (5 cols on lg): Patient Lookup, Verified Card, Routing, Floor Map */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Patient Lookup Search Bar */}
              <section className="flex flex-col gap-1">
                <label
                  htmlFor="patientSearchInput"
                  className="text-xs text-on-surface flex items-center justify-between"
                >
                  <span className="font-semibold">Patient Lookup & Verification</span>
                  <span className="text-[10px] text-primary flex items-center gap-0.5 font-bold">
                    <span className="material-symbols-outlined text-[13px]">offline_bolt</span>
                    Fast Match
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-outline text-[17px]">
                    search
                  </span>
                  <input
                    id="patientSearchInput"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Name, #VEM ID, Phone..."
                    className="w-full h-8 sm:h-9 pl-8 pr-10 bg-surface-container-lowest rounded-lg text-xs sm:text-[13px] text-on-surface border border-surface-container shadow-xs outline-none focus:border-primary focus:ring-1.5 focus:ring-primary/20 transition-all placeholder:text-outline"
                  />
                  <div className="absolute right-1.5 flex items-center">
                    <button
                      type="button"
                      aria-label="Scan QR Code"
                      title="Scan Patient Barcode / QR"
                      className="h-6 w-6 rounded-md bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Verified Matched Patient Card */}
              <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
                <div className="p-2.5 sm:p-3 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYPROPRESqxRiuvBnfZCzPXVfihN0uPPhndtsXt1n3pbWU3Y1mpItFTKSj7YdloEsdv_05NXFp7CIxlinWIcd8hVMU5hvYVe1MBN-SYdfX3MK9FKjAJyhWynddfm1paYnXC_inagY7vEK8jdnYO-ZpQai4t0gobbDmMEaDb4GMizYha0VeIcdA9BQ-cP-KeV8CTQz1401RkK7NL1ET7NmDJF3tmMkwgXZYStjPcYhP"
                          alt="Olumide Adeleke"
                          className="w-10 h-10 rounded-full object-cover shadow-xs border border-surface-container-high"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 bg-tertiary text-on-tertiary w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h2 className="text-xs sm:text-sm text-on-surface truncate font-bold">
                            Olumide Adeleke
                          </h2>
                          <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-semibold">
                            Male, 44y
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] mt-0.5">
                          <span className="font-bold text-primary font-mono">#VEM-88219</span>
                          <span>•</span>
                          <span>+234 803 491 8820</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Switch Patient"
                      className="text-primary text-[11px] px-2 py-0.5 rounded-md hover:bg-surface-container active:bg-surface-container-high transition-colors font-bold shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Insurance Pre-Auth Badge Row */}
                  <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-surface-container">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                        verified_user
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-on-surface font-semibold truncate">
                          AXA Mansard HMO · #MAN-992-01
                        </span>
                        <span className="text-[10px] text-tertiary font-medium">
                          Pre-Auth #AXA-8819 Cleared
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold shrink-0">
                      Tier 1
                    </span>
                  </div>
                </div>

                {/* Match Banner: Booking Confirmation */}
                <div className="bg-primary-fixed/60 px-3 py-2 flex items-center justify-between gap-2 text-on-primary-fixed border-t border-primary-fixed">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-primary text-[17px] shrink-0">
                      calendar_month
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">
                        Today 10:30 AM · Dr. Amara Okafor
                      </span>
                      <span className="text-[10px] opacity-90 truncate">
                        Retinal Specialist · Comprehensive Exam
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.2 rounded-full bg-primary text-on-primary uppercase tracking-wider shrink-0 shadow-xs font-bold text-[9px]">
                    Confirmed
                  </span>
                </div>
              </section>

              {/* Station & Priority Routing Section */}
              <section className="bg-surface-container-lowest p-2.5 sm:p-3 rounded-xl shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">meeting_room</span>
                    Target Station Routing
                  </span>
                  <span className="text-[10px] text-tertiary font-bold bg-tertiary-fixed/40 px-2 py-0.2 rounded-full">
                    Ready
                  </span>
                </div>

                {/* Station Picker Card */}
                <div className="bg-surface-container-low rounded-lg p-2 flex items-center justify-between border border-surface-container">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKZWXr4FK9VmfizCEVT_vogodIbvZAp2tJbJFfOjJoKds_zZe33UY5bMbVnPLXIQwJ5EGQggX3bKtqLoCnd1a-63FoMDXbWVOGJhS5_hEQ6qemt5jNa5UxTmZLKu_KMh4DLHk6zf9TSgEIwyZJ7vzoYqamrnpoN-yl7NUEiQbKl781jQwDaH1NJfvZ2BstK7cdm30TYpLQh8KKl_MS5j4oHbef9f-CEtJFkhJeXK6_"
                      alt="Dr. Amara Okafor"
                      className="w-8 h-8 rounded-full object-cover shadow-xs border border-surface-container-highest shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-on-surface font-bold truncate">Consultation Room 1</span>
                      <span className="text-[10px] text-on-surface-variant truncate">
                        Dr. Amara Okafor (Retinal Lead)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Choose Station"
                    className="h-6 px-2 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] flex items-center gap-0.5 font-semibold shrink-0"
                  >
                    <span>Change</span>
                    <span className="material-symbols-outlined text-[13px]">expand_more</span>
                  </button>
                </div>

                {/* Priority Selector Segmented Bar */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Queue Priority Level
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container">
                    <button
                      type="button"
                      onClick={() => setPriority("standard")}
                      className={`py-1.5 rounded-md text-center text-xs transition-all ${
                        priority === "standard"
                          ? "bg-primary text-on-primary shadow-xs font-bold"
                          : "text-on-surface hover:bg-surface-container font-medium"
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority("senior")}
                      className={`py-1.5 rounded-md text-center text-xs transition-all ${
                        priority === "senior"
                          ? "bg-primary text-on-primary shadow-xs font-bold"
                          : "text-on-surface hover:bg-surface-container font-medium"
                      }`}
                    >
                      Senior / Peds
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority("urgent")}
                      className={`py-1.5 rounded-md text-center text-xs transition-all ${
                        priority === "urgent"
                          ? "bg-error text-on-error shadow-xs font-bold"
                          : "text-on-surface hover:bg-surface-container font-medium"
                      }`}
                    >
                      Stat Urgent
                    </button>
                  </div>
                </div>
              </section>

              {/* Clinic Floor Map Preview */}
              <section className="bg-surface-container-lowest p-2.5 sm:p-3 rounded-xl shadow-xs border border-surface-container flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[15px]">map</span>
                    Location: Ground Floor West Wing
                  </span>
                  <span className="text-[10px] text-primary font-bold">Map</span>
                </div>
                <div className="w-full h-20 rounded-lg bg-surface-container flex items-center justify-center relative overflow-hidden border border-surface-container-high">
                  <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-xs border border-primary/20">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      <span className="text-xs text-on-surface font-bold">
                        Dr. Okafor: Room 1
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (7 cols on lg): Visit Purpose, Emergency Bypass, Billing, Ticket Generator */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Visit Purpose Interactive Grid */}
              <section className="bg-surface-container-lowest p-2.5 sm:p-3 rounded-xl shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-on-surface font-semibold">
                    Select Visit Purpose
                  </label>
                  <span className="text-[10px] text-on-surface-variant">Tap to switch destination</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Option 1: Consultation */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("consultation")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "consultation"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "consultation"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">medical_services</span>
                      </span>
                      {selectedPurpose === "consultation" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Eye Consultation</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "consultation" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Specialist exam
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Test & Refraction */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("refraction")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "refraction"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "refraction"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                      </span>
                      {selectedPurpose === "refraction" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Test & Refraction</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "refraction" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Optometry & IOP
                      </span>
                    </div>
                  </button>

                  {/* Option 3: Lens Purchase */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("lens_purchase")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "lens_purchase"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "lens_purchase"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-secondary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">lens</span>
                      </span>
                      {selectedPurpose === "lens_purchase" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Lens Purchase</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "lens_purchase" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Single / Progressive
                      </span>
                    </div>
                  </button>

                  {/* Option 4: Frame Selection */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("frame_selection")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "frame_selection"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "frame_selection"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">eyeglasses</span>
                      </span>
                      {selectedPurpose === "frame_selection" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Frame Selection</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "frame_selection" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Styling & fitting
                      </span>
                    </div>
                  </button>

                  {/* Option 5: Lens Pickup */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("pickup")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "pickup"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "pickup"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-tertiary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                      </span>
                      {selectedPurpose === "pickup" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Lens Pickup</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "pickup" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Collection & review
                      </span>
                    </div>
                  </button>

                  {/* Option 6: Follow-up Check */}
                  <button
                    type="button"
                    onClick={() => setSelectedPurpose("follow_up")}
                    className={`text-left p-2.5 rounded-lg transition-all transform active:scale-[0.98] flex flex-col justify-between min-h-[68px] sm:min-h-[76px] border ${
                      selectedPurpose === "follow_up"
                        ? "bg-primary text-on-primary shadow-xs border-primary"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          selectedPurpose === "follow_up"
                            ? "bg-surface-container-lowest/20 text-on-primary"
                            : "bg-surface-container text-outline"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">history</span>
                      </span>
                      {selectedPurpose === "follow_up" && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs block font-bold leading-tight">Follow-up Check</span>
                      <span
                        className={`text-[10px] block mt-0.5 leading-tight ${
                          selectedPurpose === "follow_up" ? "opacity-90" : "text-on-surface-variant"
                        }`}
                      >
                        Post-review
                      </span>
                    </div>
                  </button>
                </div>

                {/* Emergency Red Banner Bypass Option */}
                <button
                  type="button"
                  onClick={handleEmergencyBypass}
                  className={`w-full bg-error-container text-on-error-container p-2.5 rounded-lg flex items-center justify-between text-left border border-error/20 active:opacity-90 transition-all ${
                    emergencyAlertActive ? "animate-pulse ring-2 ring-error/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-error">
                        Emergency / Red Eye Trauma
                      </span>
                      <span className="text-[10px] text-on-error-container">
                        Immediate Doctor Triage Bypass (STAT CODE RED)
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-error text-[18px]">chevron_right</span>
                </button>
              </section>

              {/* Payment & Billing Mode */}
              <section className="bg-surface-container-lowest p-2.5 sm:p-3 rounded-xl shadow-xs border border-surface-container flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
                    Billing Mode
                  </span>
                  <span className="text-[10px] text-tertiary font-bold bg-tertiary-fixed/40 px-2 py-0.2 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label
                    onClick={() => setBillingMode("hmo")}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                      billingMode === "hmo"
                        ? "bg-surface-container-low border-primary/40 shadow-xs"
                        : "bg-surface-container-lowest border-surface-container hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="material-symbols-outlined text-primary text-[18px] shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {billingMode === "hmo" ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-on-surface font-bold truncate">
                          AXA Mansard HMO (Pre-Authorized)
                        </span>
                        <span className="text-[10px] text-on-surface-variant truncate">
                          Co-pay: ₦0.00 • Optical Consultation Included
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold shrink-0">
                      Pre-Auth OK
                    </span>
                  </label>

                  <label
                    onClick={() => setBillingMode("cash")}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                      billingMode === "cash"
                        ? "bg-surface-container-low border-primary/40 shadow-xs"
                        : "bg-surface-container-lowest border-surface-container hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                        {billingMode === "cash" ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-on-surface font-semibold truncate">
                          Private Self-Pay / Direct POS
                        </span>
                        <span className="text-[10px] text-on-surface-variant truncate">
                          Card POS, Transfer or Cash at Desk
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface font-bold shrink-0">₦15,000</span>
                  </label>
                </div>
              </section>

              {/* Primary Action & Queue Generator Card */}
              <div className="bg-surface-container-lowest p-2.5 sm:p-3 rounded-xl shadow-xs border border-surface-container flex flex-col gap-2">
                <button
                  type="button"
                  id="checkInSubmitBtn"
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className={`w-full h-10 sm:h-11 rounded-lg text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] ${
                    isCheckedIn
                      ? "bg-tertiary text-on-tertiary"
                      : "bg-primary text-on-primary hover:bg-primary-hover active:bg-secondary"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      <span>Dispensing Token #Q-04...</span>
                    </>
                  ) : isCheckedIn ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Checked In: Token Q-04 Active</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      <span>Check-In & Generate Queue Token #Q-04</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1 text-on-surface-variant text-center px-2">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">sms</span>
                  <span className="text-[10px]">
                    SMS token to +234 803 491 8820 · Thermal slip queued
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slip Generator / Thermal Ticket Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center relative border border-slate-200">
            <button
              onClick={() => setShowSlipModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[26px]">check_circle</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight">Check-In Successful</h3>
            <p className="text-xs text-slate-500 mb-4">VEMTAP Eye Clinic · Victoria Island</p>

            <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center gap-2 my-2">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Queue Token Pass
              </span>
              <div className="text-4xl font-extrabold text-[#0055c4] tracking-tight">#Q-04</div>
              <div className="text-xs font-semibold text-slate-700">Olumide Adeleke</div>
              <div className="text-[11px] text-slate-500">
                Exam Room 1 · Dr. Amara Okafor (Retinal Lead)
              </div>

              <div className="my-2 p-2 bg-white rounded-lg border border-slate-200">
                <QRCode value="VEMTAP:Q-04:VEM-88219" size={88} />
              </div>

              <div className="w-full flex justify-between text-[11px] text-slate-600 border-t border-slate-200 pt-2 font-mono">
                <span>EST. WAIT: 11 MIN</span>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSlipModal(false);
                  router.push("/reception/queue");
                }}
                className="py-2.5 px-3 rounded-xl bg-[#0055c4] hover:bg-[#0047a6] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Queue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
