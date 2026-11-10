"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type CaptureMode = "camera" | "upload" | "batch" | "flatbed";

export default function OCRDocumentScannerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<CaptureMode>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [gridOn, setGridOn] = useState(true);
  const [highPassOn, setHighPassOn] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Editable parsed values
  const [patientName, setPatientName] = useState("Patient Name");
  const [patientDob, setPatientDob] = useState("14/03/1990");
  const [odSph, setOdSph] = useState("-1.75");
  const [odCyl, setOdCyl] = useState("-0.50");
  const [odAxis, setOdAxis] = useState("175°");
  const [osSph, setOsSph] = useState("-2.00");
  const [osCyl, setOsCyl] = useState("-0.75");
  const [osAxis, setOsAxis] = useState("010°");
  const [iopNotes, setIopNotes] = useState(
    "Applanation IOP: OD 14 mmHg, OS 15 mmHg. Mild bilateral dry eye signs."
  );

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAccepted(true);
    }, 1000);
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-24">
      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Documents</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* AI Status Pill & Mode Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-surface-container w-fit">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
              </span>
              <span className="font-label-sm text-on-surface font-bold text-[13px]">
                AI Neuromorphic Engine v4.2 Active
              </span>
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[17px] text-tertiary">memory</span>
              <span>Low Latency Edge Processing</span>
            </div>
          </div>

          {/* Capture Mode Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setMode("camera")}
              className={`shrink-0 px-4 py-2 rounded-full font-label-sm font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 ${
                mode === "camera"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">photo_camera</span>
              <span>Camera Live</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`shrink-0 px-4 py-2 rounded-full font-label-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                mode === "upload"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">file_upload</span>
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={`shrink-0 px-4 py-2 rounded-full font-label-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                mode === "batch"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">dynamic_feed</span>
              <span>Batch Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("flatbed")}
              className={`shrink-0 px-4 py-2 rounded-full font-label-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                mode === "flatbed"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">scanner</span>
              <span>Flatbed Sync</span>
            </button>
          </div>

          {/* Responsive Two-Column Workspace on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Live Viewfinder, Overlays & Batch Thumbnails */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Live Optical Viewfinder Card */}
              <div
                className={`relative w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-xl flex items-center justify-center select-none border border-neutral-800 ${
                  highPassOn ? "grayscale contrast-150" : ""
                }`}
                style={{ minHeight: "440px" }}
              >
                {/* Background Scan Paper Document */}
                <div className="relative w-[92%] sm:w-[86%] my-6 rounded-xl bg-surface-container-lowest p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-hidden transform -rotate-1 border border-neutral-300">
                  {/* Subtle Paper Texture */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-amber-100 via-transparent to-stone-200"></div>

                  {/* Document Header */}
                  <div className="relative z-10 border-b border-surface-container pb-2 mb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-bold">
                          Historical Record Card
                        </span>
                        <span className="font-headline-sm text-on-surface tracking-tight font-extrabold uppercase text-[15px]">
                          Victoria Island Eye Clinic & Surgical Depot
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          Plot 1204 Saka Tinubu St, Victoria Island, Lagos
                        </span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded bg-surface-container-high font-label-sm text-[11px] text-on-surface font-mono font-bold">
                        #VMT-1042
                      </div>
                    </div>
                  </div>

                  {/* Detected OCR Region: Patient Identity */}
                  <div className="relative z-10 p-2.5 rounded-xl bg-surface-container-low/90 border border-primary/30 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-[10px] uppercase text-outline font-bold">
                        Patient Full Name
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-[10px] tracking-wide inline-flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Name: 98% Conf
                      </span>
                    </div>
                    <p className="font-headline-sm text-on-surface font-extrabold text-[15px] tracking-wide">
                      Patient Name
                    </p>
                    <div className="flex gap-4 mt-1 font-body-sm text-[12px] text-on-surface-variant font-medium">
                      <span>
                        DOB: <strong className="text-on-surface">14/03/1990</strong>
                      </span>
                      <span>
                        Gender: <strong className="text-on-surface">Male</strong>
                      </span>
                      <span>
                        File Date: <strong className="text-on-surface">22-OCT-2007</strong>
                      </span>
                    </div>
                  </div>

                  {/* Detected OCR Region: Prescription Matrix */}
                  <div className="relative z-10 p-2.5 rounded-xl bg-surface-container-low/90 border border-primary/30 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-[10px] uppercase text-outline font-bold">
                        Refraction & Acuity (Snellen)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-[10px] tracking-wide inline-flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Rx Table: 94% Conf
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-[12px] bg-surface-container-lowest p-2 rounded-lg border border-surface-container">
                      <div className="font-label-sm text-outline font-bold text-left">EYE</div>
                      <div className="font-label-sm text-outline font-bold">SPH</div>
                      <div className="font-label-sm text-outline font-bold">CYL</div>
                      <div className="font-label-sm text-outline font-bold">AXIS</div>
                      <div className="font-bold text-left text-primary">OD (R)</div>
                      <div className="font-bold text-on-surface">-1.75</div>
                      <div className="font-bold text-on-surface">-0.50</div>
                      <div className="font-bold text-on-surface">175°</div>
                      <div className="font-bold text-left text-primary">OS (L)</div>
                      <div className="font-bold text-on-surface">-2.00</div>
                      <div className="font-bold text-on-surface">-0.75</div>
                      <div className="font-bold text-on-surface">010°</div>
                    </div>
                  </div>

                  {/* Detected OCR Region: Cursive Notes / IOP */}
                  <div className="relative z-10 p-2.5 rounded-xl bg-error-container/40 border border-error/30 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-[10px] uppercase text-on-error-container font-bold">
                        Cursive Diagnosis / IOP
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[10px] tracking-wide inline-flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[12px]">priority_high</span>
                        IOP / Notes: 86% Conf
                      </span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface italic line-clamp-1">
                      "Applanation IOP: OD 14 mmHg, OS 15 mmHg. Mild bilateral dry eye signs..."
                    </p>
                  </div>

                  {/* Doctor Signature Block Simulation */}
                  <div className="relative z-10 flex items-end justify-between pt-1">
                    <div className="font-body-sm text-[10px] text-outline font-medium">
                      Examining Optometrist: Dr. K. Danmole (FNCO)
                    </div>
                    <div className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono font-bold">
                      STAMP: AUTHENTIC
                    </div>
                  </div>
                </div>

                {/* Reticle Brackets Overlay */}
                <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  </div>
                  {/* Center Pulsing Laser Reticle */}
                  <div className="w-full flex items-center justify-center">
                    <div className="w-24 h-0.5 bg-primary shadow-[0_0_10px_#066cf4] animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>

                {/* Auto-Deskew Badge Floating Top */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white font-label-sm text-[11px] backdrop-blur-md flex items-center gap-1.5 shadow-sm border border-white/10">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">check</span>
                  <span>Live Auto-Deskew Active (Angle: -1.2°)</span>
                </div>

                {/* Viewfinder Tools Floating Right */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setFlashOn(!flashOn)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      flashOn ? "bg-amber-400 text-black font-bold" : "text-white hover:bg-white/10"
                    }`}
                    title="Toggle Flash"
                  >
                    <span className="material-symbols-outlined text-[19px]">flash_on</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridOn(!gridOn)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      gridOn ? "bg-primary text-white font-bold" : "text-white hover:bg-white/10"
                    }`}
                    title="Toggle Alignment Grid"
                  >
                    <span className="material-symbols-outlined text-[19px]">grid_on</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighPassOn(!highPassOn)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      highPassOn ? "bg-white text-black font-bold" : "text-white hover:bg-white/10"
                    }`}
                    title="Toggle B&W High-Pass"
                  >
                    <span className="material-symbols-outlined text-[19px]">contrast</span>
                  </button>
                </div>
              </div>

              {/* Extraction Presets & Settings */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    Extraction Presets & Settings
                  </span>
                  <span className="font-label-sm text-outline text-[12px]">v8.9-med</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <div className="text-[11px] font-bold text-on-surface-variant uppercase">
                      Document Archetype
                    </div>
                    <div className="font-label-sm font-bold text-on-surface mt-0.5">
                      Legacy VEMTAP Clinic Card (Form 4B)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                    <div className="text-[11px] font-bold text-on-surface-variant uppercase">
                      AI Optical Engine
                    </div>
                    <div className="font-label-sm font-bold text-on-surface mt-0.5">
                      Cursive Parser v8.9-med
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-sm text-on-surface font-semibold text-xs">
                    Auto-Enhance Luminance & Contrast
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoEnhance(!autoEnhance)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      autoEnhance ? "bg-primary justify-end" : "bg-surface-container-highest justify-start"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs"></span>
                  </button>
                </div>
              </div>

              {/* Batch Processing Strip */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      dynamic_feed
                    </span>
                    Batch Queue
                  </span>
                  <span className="font-label-sm text-primary font-bold text-xs">3 Cards in Memory</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Thumbnail 1 */}
                  <div className="rounded-xl bg-surface-container-low p-2 flex flex-col gap-1 border border-surface-container">
                    <div className="relative w-full aspect-[4/3] rounded-lg bg-surface-container overflow-hidden">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYPROPRESqxRiuvBnfZCzPXVfihN0uPPhndtsXt1n3pbWU3Y1mpItFTKSj7YdloEsdv_05NXFp7CIxlinWIcd8hVMU5hvYVe1MBN-SYdfX3MK9FKjAJyhWynddfm1paYnXC_inagY7vEK8jdnYO-ZpQai4t0gobbDmMEaDb4GMizYha0VeIcdA9BQ-cP-KeV8CTQz1401RkK7NL1ET7NmDJF3tmMkwgXZYStjPcYhP"
                        alt="Card 1"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-tertiary text-on-tertiary font-label-sm text-[8px] font-bold">
                        READY
                      </span>
                    </div>
                    <span className="font-label-sm text-[11px] font-bold text-on-surface truncate">
                      Card_0412_Front
                    </span>
                  </div>

                  {/* Thumbnail 2 */}
                  <div className="rounded-xl bg-surface-container-low p-2 flex flex-col gap-1 border border-surface-container">
                    <div className="relative w-full aspect-[4/3] rounded-lg bg-surface-container overflow-hidden">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyJIRm0BQwkP5DvOC1SrPeaGBxpAwJFkN9SZBCBZ6AAYUU5ejTHjmmV4EsKSEqBdelBwswwQJ5HN2edfwMHr_iIGKVbdHz3IlDkyND1O-6BCcpiIo6u5i30TaDIB2Iw_r4lk2VAKEogCEXGwsUWVnY27CAKDwqGabofiLh7ztsqGxpRGjnrU4BM3lqwih4t-6aSFLdG-VCSGueSsogqAYJaI-6BLa22Rev_TV6EkIe"
                        alt="Card 2"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-tertiary text-on-tertiary font-label-sm text-[8px] font-bold">
                        READY
                      </span>
                    </div>
                    <span className="font-label-sm text-[11px] font-bold text-on-surface truncate">
                      Card_0412_Back
                    </span>
                  </div>

                  {/* Thumbnail 3 */}
                  <div className="rounded-xl bg-surface-container-low p-2 flex flex-col gap-1 border border-surface-container">
                    <div className="relative w-full aspect-[4/3] rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center">
                        <span className="font-label-sm text-primary font-extrabold text-xs">84%</span>
                        <span className="text-[9px] text-primary font-bold uppercase">Parsing</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-[11px] font-bold text-primary truncate">
                      Card_0413_Front
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Real-Time Parsed Data Editor & Acceptance */}
            <div className="lg:col-span-5 flex flex-col gap-3 sticky top-24">
              <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[17px]">
                      edit_document
                    </span>
                    Extracted Patient Record
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                    Conf: 94%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-semibold text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-semibold text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Refraction Fields */}
                  <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container space-y-1.5">
                    <span className="font-bold text-on-surface text-[11px] block">
                      Refraction Prescription:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OD SPH</span>
                        <input
                          type="text"
                          value={odSph}
                          onChange={(e) => setOdSph(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OD CYL</span>
                        <input
                          type="text"
                          value={odCyl}
                          onChange={(e) => setOdCyl(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OD AXIS</span>
                        <input
                          type="text"
                          value={odAxis}
                          onChange={(e) => setOdAxis(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OS SPH</span>
                        <input
                          type="text"
                          value={osSph}
                          onChange={(e) => setOsSph(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OS CYL</span>
                        <input
                          type="text"
                          value={osCyl}
                          onChange={(e) => setOsCyl(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-outline font-semibold">OS AXIS</span>
                        <input
                          type="text"
                          value={osAxis}
                          onChange={(e) => setOsAxis(e.target.value)}
                          className="w-full h-7 px-1.5 rounded-md bg-surface-container-lowest text-xs font-mono font-bold text-center border border-surface-container"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes & Tonometry */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-semibold">
                      Extracted Notes & Tonometry
                    </label>
                    <textarea
                      rows={2}
                      value={iopNotes}
                      onChange={(e) => setIopNotes(e.target.value)}
                      className="p-2 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={isProcessing}
                    className="w-full h-9 sm:h-10 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover active:bg-secondary transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">
                          progress_activity
                        </span>
                        <span>Saving to Patient Profile...</span>
                      </>
                    ) : accepted ? (
                      <>
                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                        <span>Record Saved to Profile ✓</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        <span>Accept & Populate Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security & Compliance Footer */}
              <div className="flex items-center justify-center gap-1.5 text-on-surface-variant text-[10px] py-1">
                <span className="material-symbols-outlined text-[13px] text-tertiary">lock</span>
                <span>NDPR & HIPAA Compliant · 256-bit In-Transit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

