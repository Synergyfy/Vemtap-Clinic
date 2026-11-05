"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type FilterType = "all" | "hmo" | "private" | "pediatric" | "branch";
type ViewMode = "cards" | "table";

export default function ReceptionPatientDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 900);
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-16">
      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Directory Header Section & Quick Actions */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface tracking-tight">
                Unified Patient Registry
              </h2>
              <p className="text-[11px] sm:text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-primary font-bold">1,428</span> Registered across network
              </p>
            </div>

            {/* Quick Action Utility Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* View Switcher */}
              <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  aria-label="List view"
                  title="List view"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-colors flex items-center justify-center ${
                    viewMode === "table"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  aria-label="Grid view"
                  title="Grid view"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-colors flex items-center justify-center ${
                    viewMode === "cards"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSync}
                aria-label="Quick directory sync"
                title="Sync with central registry"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors border border-surface-container-high shadow-xs"
              >
                <span
                  className={`material-symbols-outlined text-[15px] sm:text-[16px] ${
                    isSyncing ? "animate-spin text-primary" : ""
                  }`}
                >
                  sync
                </span>
              </button>

              <Link
                href="/reception/patients/register"
                className="h-7 sm:h-8 px-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">person_add</span>
                <span>New Patient</span>
              </Link>
              <Link
                href="/reception/documents/ocr"
                className="h-7 sm:h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center gap-1 text-xs font-semibold transition-colors active:scale-95 shadow-xs border border-surface-container-high"
                title="Scan Patient Card / OCR"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">document_scanner</span>
                <span className="hidden sm:inline">Scan OCR</span>
              </Link>
              <button
                type="button"
                className="h-7 sm:h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center gap-1 text-xs font-semibold transition-colors active:scale-95 shadow-xs border border-surface-container-high"
                title="Bulk Import Roster"
                onClick={() => alert("Bulk Roster Import: Upload CSV or Excel patient schedule.")}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">upload_file</span>
                <span className="hidden md:inline">Import</span>
              </button>
            </div>
          </section>

          {/* Search Bar & Fast Filters */}
          <section className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container flex flex-col gap-2">
            {/* Search Bar */}
            <div className="relative w-full">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none material-symbols-outlined text-[17px]">
                search
              </span>
              <input
                id="patientSearchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name, ID (#VEM-), Phone..."
                className="w-full h-8 sm:h-9 pl-8 pr-16 rounded-lg bg-surface-container text-on-surface placeholder:text-on-surface-variant text-xs sm:text-[13px] focus:outline-none focus:bg-surface-container-lowest focus:ring-1.5 focus:ring-primary/20 border border-transparent focus:border-primary transition-all"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Barcode scan"
                  title="Scan barcode"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">barcode_scanner</span>
                </button>
                <button
                  type="button"
                  aria-label="Voice lookup"
                  title="Voice search"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">mic</span>
                </button>
              </div>
            </div>

            {/* Scrollable Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                  activeFilter === "all"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1 py-0.1 rounded-full text-[9px] ${
                    activeFilter === "all" ? "bg-white/20" : "bg-black/5"
                  }`}
                >
                  1,428
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("hmo")}
                className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                  activeFilter === "hmo"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>HMO</span>
                <span
                  className={`text-[9px] ${
                    activeFilter === "hmo" ? "text-white" : "text-on-surface-variant"
                  }`}
                >
                  982
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("private")}
                className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                  activeFilter === "private"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>Private</span>
                <span
                  className={`text-[9px] ${
                    activeFilter === "private" ? "text-white" : "text-on-surface-variant"
                  }`}
                >
                  446
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("pediatric")}
                className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                  activeFilter === "pediatric"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span>Pediatric</span>
                <span
                  className={`text-[9px] ${
                    activeFilter === "pediatric" ? "text-white" : "text-on-surface-variant"
                  }`}
                >
                  214
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("branch")}
                className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                  activeFilter === "branch"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[13px] text-primary">pin_drop</span>
                <span>VI Center</span>
              </button>
            </div>
          </section>

          {/* Cards Stack View (2 columns on md/lg) */}
          {viewMode === "cards" ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Card 1: Olumide Adeleke */}
              <article className="rounded-xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all border border-surface-container flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-inner">
                      OA
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                          Olumide Adeleke
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">
                          (34y · Male)
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
                        <span className="text-primary font-bold">#VEM-88219</span>
                        <span className="text-outline-variant">·</span>
                        <span>Local: #VMT-1042</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open context menu"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>

                {/* Coverage & Contact Meta */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px] text-secondary">
                      verified_user
                    </span>
                    AXA Mansard HMO
                  </span>
                  <a
                    href="tel:+2348031234567"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold hover:text-primary transition-colors text-[10px]"
                  >
                    <span className="material-symbols-outlined text-[12px] text-primary">call</span>
                    +234 803 123 4567
                  </a>
                </div>

                {/* Last Clinical Activity Strip */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tertiary"></span>
                    </span>
                    <div className="truncate">
                      <p className="text-xs text-on-surface font-bold truncate">
                        Refraction & Corneal Topography
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        Today, 10:15 AM · Room 3B (Dr. S. Okonjo)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold shrink-0">
                    In Hub
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-surface-container">
                  <Link
                    href="/clinic/patients/1"
                    className="col-span-6 h-7 sm:h-8 px-2 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="/reception/check-in"
                    className="col-span-4 h-7 sm:h-8 px-2 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                    <span>Check-In</span>
                  </Link>
                  <a
                    href="tel:+2348031234567"
                    aria-label="Call patient"
                    className="col-span-2 h-7 sm:h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[15px]">phone_enabled</span>
                  </a>
                </div>
              </article>

              {/* Card 2: Tiwa Adeleke (Child / Dependent) */}
              <article className="rounded-xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all border border-surface-container flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs shrink-0 shadow-inner">
                      TA
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                          Tiwa Adeleke
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">
                          (8y · Female)
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full bg-tertiary-container text-on-tertiary-container text-[9px] font-bold">
                          PEDIATRIC
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
                        <span className="text-primary font-bold">#VEM-88220</span>
                        <span className="text-outline-variant">·</span>
                        <span>Local: #VMT-1043</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open context menu"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>

                {/* Dependent Relationship & HMO */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px] text-secondary">
                      family_restroom
                    </span>
                    AXA Mansard (Dependent)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold">
                    <span className="material-symbols-outlined text-[12px]">shield_person</span>
                    Ward of Olumide A.
                  </span>
                </div>

                {/* Last Clinical Activity Strip */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                    </span>
                    <div className="truncate">
                      <p className="text-xs text-on-surface font-bold truncate">
                        Pediatric Amblyopia Assessment
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        Today, 11:00 AM · Pediatric Suite 1
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-extrabold shrink-0">
                    Queue #04
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-surface-container">
                  <Link
                    href="/clinic/patients/1"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="/reception/check-in"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">checklist</span>
                    <span>Check-In</span>
                  </Link>
                </div>
              </article>

              {/* Card 3: Dr. Ibrahim Bello */}
              <article className="rounded-xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all border border-surface-container flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-xs shrink-0">
                      IB
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                          Dr. Ibrahim Bello
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">
                          (51y · Male)
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
                        <span className="text-primary font-bold">#VEM-74902</span>
                        <span className="text-outline-variant">·</span>
                        <span>Local: #IKJ-0829</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open context menu"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>

                {/* Coverage Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px] text-tertiary">star</span>
                    Hygeia HMO (Private VIP)
                  </span>
                  <a
                    href="tel:+2348023349911"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold hover:text-primary transition-colors text-[10px]"
                  >
                    <span className="material-symbols-outlined text-[12px] text-primary">call</span>
                    +234 802 334 9911
                  </a>
                </div>

                {/* Last Activity Strip */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant shrink-0"></span>
                    <div className="truncate">
                      <p className="text-xs text-on-surface font-bold truncate">
                        Glaucoma Visual Field 24-2 & GDX
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        14 Nov 2024 · Ikeja Center (Dr. Jinadu)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold shrink-0">
                    Follow-up
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-surface-container">
                  <Link
                    href="/clinic/patients/1"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="/reception/check-in"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                    <span>Check-In</span>
                  </Link>
                </div>
              </article>

              {/* Card 4: Ngozi Eze */}
              <article className="rounded-xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all border border-surface-container flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-xs shrink-0">
                      NE
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                          Ngozi Eze
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">
                          (29y · Female)
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
                        <span className="text-primary font-bold">#VEM-88931</span>
                        <span className="text-outline-variant">·</span>
                        <span>Local: #VI-1102</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Open context menu"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>

                {/* Coverage Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px] text-secondary">verified</span>
                    Reliance HMO
                  </span>
                  <a
                    href="tel:+2348187721042"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold hover:text-primary transition-colors text-[10px]"
                  >
                    <span className="material-symbols-outlined text-[12px] text-primary">call</span>
                    +234 818 772 1042
                  </a>
                </div>

                {/* Last Activity Strip */}
                <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant shrink-0"></span>
                    <div className="truncate">
                      <p className="text-xs text-on-surface font-bold truncate">
                        Contact Lens Trial Fitting
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        10 Nov 2024 · Contact Lens Clinic
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold shrink-0">
                    Dispensed
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-surface-container">
                  <Link
                    href="/clinic/patients/1"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="/clinic/patients/1"
                    className="h-7 sm:h-8 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                    <span>Rx History</span>
                  </Link>
                </div>
              </article>
            </section>
          ) : (
            /* Table / List View */
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-full">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Patient & ID</th>
                      <th className="py-2.5 px-3">Demographics</th>
                      <th className="py-2.5 px-3">Payer / Insurance</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Recent Activity</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-xs">
                    {/* Row 1 */}
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                            OA
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-xs">Olumide Adeleke</div>
                            <div className="font-mono text-primary text-[10px] font-semibold">
                              #VEM-88219
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>Male, 34 yrs</div>
                        <div className="text-[10px] text-on-surface-variant">Adult (Self)</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                          AXA Mansard HMO
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>+234 803 123 4567</div>
                        <div className="text-[10px] text-on-surface-variant">olumide.adeleke@email.ng</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                          In Hub · Rm 3B
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/clinic/patients/1"
                            className="px-2 py-1 rounded-md bg-surface-container text-on-surface font-semibold text-[11px] hover:bg-surface-container-high transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            href="/reception/check-in"
                            className="px-2 py-1 rounded-md bg-primary text-on-primary font-bold text-[11px] hover:bg-primary-hover transition-colors"
                          >
                            Check-In
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[10px] shrink-0">
                            TA
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-xs">Tiwa Adeleke</div>
                            <div className="font-mono text-primary text-[10px] font-semibold">
                              #VEM-88220
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>Female, 8 yrs</div>
                        <span className="px-1.5 py-0.1 rounded bg-tertiary-container text-on-tertiary-container text-[9px] font-bold">
                          Pediatric
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                          AXA (Dependent)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>Ward of Olumide A.</div>
                        <div className="text-[10px] text-on-surface-variant">+234 803 123 4567</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                          Queue #04
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/clinic/patients/1"
                            className="px-2 py-1 rounded-md bg-surface-container text-on-surface font-semibold text-[11px] hover:bg-surface-container-high transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            href="/reception/check-in"
                            className="px-2 py-1 rounded-md bg-primary text-on-primary font-bold text-[11px] hover:bg-primary-hover transition-colors"
                          >
                            Check-In
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[10px] shrink-0">
                            IB
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-xs">Dr. Ibrahim Bello</div>
                            <div className="font-mono text-primary text-[10px] font-semibold">
                              #VEM-74902
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>Male, 51 yrs</div>
                        <div className="text-[10px] text-on-surface-variant">Private VIP</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold text-[10px]">
                          Hygeia HMO
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>+234 802 334 9911</div>
                        <div className="text-[10px] text-on-surface-variant">ibrahim.bello@lagos.org</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                          Follow-up (14 Nov)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/clinic/patients/1"
                            className="px-2 py-1 rounded-md bg-surface-container text-on-surface font-semibold text-[11px] hover:bg-surface-container-high transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            href="/reception/check-in"
                            className="px-2 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] transition-colors"
                          >
                            Check-In
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[10px] shrink-0">
                            NE
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-xs">Ngozi Eze</div>
                            <div className="font-mono text-primary text-[10px] font-semibold">
                              #VEM-88931
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>Female, 29 yrs</div>
                        <div className="text-[10px] text-on-surface-variant">Adult (Self)</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                          Reliance HMO
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>+234 818 772 1042</div>
                        <div className="text-[10px] text-on-surface-variant">ngozi.eze@tech.ng</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                          Dispensed (10 Nov)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/clinic/patients/1"
                            className="px-2 py-1 rounded-md bg-surface-container text-on-surface font-semibold text-[11px] hover:bg-surface-container-high transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            href="/clinic/patients/1"
                            className="px-2 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] transition-colors"
                          >
                            Rx History
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sticky Bottom Quick Pagination / Counter Bar */}
          <footer className="pt-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[17px]">groups</span>
                <span className="text-on-surface font-medium truncate text-xs">
                  Showing <strong className="text-on-surface">4</strong> of{" "}
                  <strong className="text-on-surface">1,428</strong> patients
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="px-2 text-on-surface font-bold text-[11px]">
                  {currentPage} / 357
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Next page"
                  className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center hover:bg-surface-container-high active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
