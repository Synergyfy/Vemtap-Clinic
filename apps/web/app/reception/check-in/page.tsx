"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";
import { useClinic } from "@/hooks/useClinics";

const normalizeQrPayload = (value: string) => value.trim();

const resolvePatientFromQr = (value: string, patients: Array<{ id: string; firstName?: string; lastName?: string }>) => {
  const raw = normalizeQrPayload(value);
  if (!raw) return null;

  const candidates = [
    raw,
    raw.replace(/^VEMTAP:/i, ""),
    raw.replace(/^VEM:/i, ""),
    raw.replace(/^PATIENT:/i, ""),
    raw.replace(/^CLINIC:/i, ""),
    raw.replace(/^QR:/i, ""),
    raw.match(/(?:patientId|patient_id|id)[:=]([A-Za-z0-9-]+)/i)?.[1] ?? "",
    raw.match(/([A-Fa-f0-9-]{8,})/)?.[1] ?? "",
  ];

  const uniqueCandidates = [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];

  for (const candidate of uniqueCandidates) {
    const exactMatch = patients.find((patient) => patient.id.toUpperCase() === candidate.toUpperCase());
    if (exactMatch) return exactMatch.id;

    const partialMatch = patients.find((patient) => patient.id.toUpperCase().includes(candidate.toUpperCase()));
    if (partialMatch) return partialMatch.id;
  }

  return null;
};

type VisitPurpose =
  | "consultation"
  | "refraction"
  | "lens_purchase"
  | "frame_selection"
  | "pickup"
  | "follow_up";

type PriorityLevel = "standard" | "senior" | "urgent";

export default function ReceptionCheckInPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  const { data: activeClinic } = useClinic(user?.clinicId ?? "");

  const clinicQrValue = useMemo(() => {
    if (activeClinic?.qrUrl) return activeClinic.qrUrl;
    if (activeClinic?.qrCode) return activeClinic.qrCode;
    if (activeClinic?.id) {
      const normalizedId = String(activeClinic.id).replace(/[^a-z0-9]/gi, "").toUpperCase();
      return normalizedId ? `VEM-${normalizedId}`.slice(0, 20) : "";
    }
    return "";
  }, [activeClinic]);

  const hasValidClinicQr = Boolean(clinicQrValue && clinicQrValue !== "VEM-CLINIC");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientIdFromQuery);
  const [selectedPurpose, setSelectedPurpose] = useState<VisitPurpose>("consultation");
  const [priority, setPriority] = useState<PriorityLevel>("standard");
  const [billingMode, setBillingMode] = useState<"hmo" | "cash">("hmo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isClinicQrDisplayOpen, setIsClinicQrDisplayOpen] = useState(false);
  const [isQrDisplayOpen, setIsQrDisplayOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerInput, setScannerInput] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scannerTimeoutRef = useRef<number | null>(null);

  const { data: patientResponse } = usePatients({ clinicId: user?.clinicId ?? "", limit: 50 });
  const patients = patientResponse?.data ?? [];

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return patients.filter((patient) => {
      if (!query) return true;
      return `${patient.firstName} ${patient.lastName} ${patient.id} ${patient.phone ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [patients, searchQuery]);

  const selectedPatient =
    filteredPatients.find((patient) => patient.id === selectedPatientId) ??
    filteredPatients[0] ??
    null;

  const clinicDisplayName = activeClinic?.name ?? "Current clinic";

  const stopScanner = () => {
    if (scannerTimeoutRef.current) {
      window.clearTimeout(scannerTimeoutRef.current);
      scannerTimeoutRef.current = null;
    }

    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const applyScanValue = (value: string) => {
    const normalized = normalizeQrPayload(value);
    if (!normalized) {
      setScannerError("Enter a valid QR code value to continue.");
      return;
    }

    const matchingPatientId = resolvePatientFromQr(normalized, patients);
    if (!matchingPatientId) {
      setScannerError("QR code was scanned, but no patient matched it. Try another code or use the search box.");
      return;
    }

    setSelectedPatientId(matchingPatientId);
    setSearchQuery("");
    setScannerInput("");
    setScannerError("");
    setIsScannerOpen(false);
    stopScanner();
  };

  const openScanner = async () => {
    setIsScannerOpen(true);
    setScannerError("");
    setScannerInput("");

    if (!("mediaDevices" in navigator) || !("BarcodeDetector" in window)) {
      setScannerError("This browser does not support live QR scanning. Paste the QR code manually instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      scannerStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const BarcodeDetectorCtor = (window as any).BarcodeDetector;
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });

      const detectLoop = async () => {
        if (!isScannerOpen || !videoRef.current) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          const firstRawValue = barcodes?.[0]?.rawValue;

          if (firstRawValue) {
            applyScanValue(firstRawValue);
            return;
          }
        } catch {
          // Continue scanning until a valid code is detected.
        }

        scannerTimeoutRef.current = window.setTimeout(detectLoop, 800);
      };

      detectLoop();
    } catch {
      setScannerError("Camera access is blocked. Paste the QR code manually instead.");
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleCheckIn = () => {
    if (!selectedPatient) return;
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
      setPriority("urgent");
    }, 400);
  };

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-12">
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="bg-surface-container-low rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">
                  Front Office Intake
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-0.5">
                <h2 className="text-xs sm:text-sm font-bold text-on-surface">Reception Intake & Routing</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <section className="rounded-xl border border-surface-container bg-surface-container-lowest p-3 shadow-xs">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Clinic QR</div>
                    <h3 className="text-sm font-bold text-on-surface">{clinicDisplayName}</h3>
                  </div>
                  {hasValidClinicQr ? (
                    <button
                      type="button"
                      onClick={() => setIsClinicQrDisplayOpen(true)}
                      className="rounded-lg border border-surface-container bg-white p-1.5 shadow-xs transition hover:scale-[1.02] hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Open clinic QR code"
                    >
                      <QRCode value={clinicQrValue} size={56} />
                    </button>
                  ) : (
                    <div className="rounded-lg border border-dashed border-surface-container bg-surface-container px-2 py-2 text-[10px] text-on-surface-variant text-center min-w-[72px]">
                      No QR
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-on-surface-variant">
                    {hasValidClinicQr
                      ? "Patients scan this code to open the check-in flow for this clinic."
                      : "Clinic QR is unavailable until a valid clinic is linked to this user."}
                  </p>
                  <button
                    type="button"
                    onClick={() => hasValidClinicQr && setIsClinicQrDisplayOpen(true)}
                    disabled={!hasValidClinicQr}
                    className="text-[10px] font-bold uppercase tracking-wide text-primary hover:text-primary/80 disabled:text-outline disabled:cursor-not-allowed"
                  >
                    View
                  </button>
                </div>
              </section>

              <section className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="patientSearchInput" className="text-xs text-on-surface font-semibold">
                    Patient Lookup & Verification
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-outline text-[17px]">search</span>
                  <input
                    id="patientSearchInput"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Name, #VEM ID, Phone..."
                    className="w-full h-8 sm:h-9 pl-8 pr-10 bg-surface-container-lowest rounded-lg text-xs sm:text-[13px] text-on-surface border border-surface-container shadow-xs outline-none focus:border-primary focus:ring-1.5 focus:ring-primary/20 transition-all placeholder:text-outline"
                  />
                </div>
              </section>

              {selectedPatient ? (
                <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col">
                  <div className="p-2.5 sm:p-3 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shadow-xs border border-surface-container-high">
                            {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 bg-tertiary text-on-tertiary w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[10px]">verified</span>
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h2 className="text-xs sm:text-sm text-on-surface truncate font-bold">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </h2>
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] mt-0.5">
                            <span className="font-bold text-primary font-mono">#{selectedPatient.id.slice(0, 8).toUpperCase()}</span>
                            <span>•</span>
                            <span>{selectedPatient.phone ?? "No phone"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsQrDisplayOpen(true)}
                          className="rounded-lg bg-white p-1.5 border border-surface-container shadow-xs transition hover:border-primary/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/20"
                          aria-label="Open patient QR code"
                        >
                          <QRCode value={`VEMTAP:${selectedPatient.id}`} size={48} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPatientId(null)}
                          className="text-primary text-[11px] px-2 py-0.5 rounded-md hover:bg-surface-container active:bg-surface-container-high transition-colors font-bold shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-surface-container">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">verified_user</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-on-surface font-semibold truncate">
                            {selectedPatient.hmoName ?? "Private patient"}
                          </span>
                          <span className="text-[10px] text-tertiary font-medium">
                            {selectedPatient.patientType === "hmo" ? "Coverage available" : "Self-pay patient"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="rounded-xl border border-dashed border-surface-container bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
                  Search a patient to begin check-in.
                </div>
              )}

              {filteredPatients.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 border border-surface-container">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant mb-2">Matching patients</div>
                  <div className="space-y-2">
                    {filteredPatients.slice(0, 5).map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`w-full text-left rounded-lg p-2 border transition-colors ${
                          selectedPatient?.id === patient.id
                            ? "border-primary bg-primary/5"
                            : "border-surface-container bg-surface-container"
                        }`}
                      >
                        <div className="font-bold text-on-surface text-sm">{patient.firstName} {patient.lastName}</div>
                        <div className="text-[10px] text-on-surface-variant">#{patient.id.slice(0, 8).toUpperCase()} • {patient.phone ?? "No phone"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3">
              <section className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-on-surface">Check-in details</h3>
                  <button
                    type="button"
                    onClick={handleEmergencyBypass}
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      emergencyAlertActive ? "bg-error text-on-error animate-pulse" : "bg-error text-on-error"
                    }`}
                  >
                    Emergency bypass
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-on-surface-variant">
                    <span className="mb-1 block font-semibold">Visit purpose</span>
                    <select
                      value={selectedPurpose}
                      onChange={(e) => setSelectedPurpose(e.target.value as VisitPurpose)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 text-on-surface border border-surface-container focus:border-primary outline-none"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="refraction">Refraction</option>
                      <option value="lens_purchase">Lens purchase</option>
                      <option value="frame_selection">Frame selection</option>
                      <option value="pickup">Pickup</option>
                      <option value="follow_up">Follow up</option>
                    </select>
                  </label>

                  <label className="text-xs text-on-surface-variant">
                    <span className="mb-1 block font-semibold">Priority</span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 text-on-surface border border-surface-container focus:border-primary outline-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="senior">Senior</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                </div>

                <label className="text-xs text-on-surface-variant">
                  <span className="mb-1 block font-semibold">Billing mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBillingMode("hmo")}
                      className={`rounded-lg px-3 py-2 font-semibold ${billingMode === "hmo" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}
                    >
                      HMO
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingMode("cash")}
                      className={`rounded-lg px-3 py-2 font-semibold ${billingMode === "cash" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}
                    >
                      Cash
                    </button>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={!selectedPatient || isSubmitting}
                  className="w-full rounded-lg bg-primary text-on-primary py-3 text-sm font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Checking in..." : "Complete check-in"}
                </button>
              </section>

              {showSlipModal && selectedPatient && (
                <section className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-surface-container flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Check-in slip</div>
                    <div className="font-bold text-on-surface text-sm">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      {selectedPurpose} • {priority} • {billingMode.toUpperCase()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <QRCode value={`VEMTAP:${selectedPatient.id}`} size={88} />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {isClinicQrDisplayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Clinic QR Code</p>
                <h3 className="text-lg font-bold text-slate-900">{clinicDisplayName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsClinicQrDisplayOpen(false)}
                className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            {hasValidClinicQr ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                  <QRCode value={clinicQrValue} size={200} />
                </div>

                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Clinic code</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-800">{clinicQrValue}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 text-center">
                No valid clinic QR is available yet. Link a real clinic to generate the check-in QR.
              </div>
            )}
          </div>
        </div>
      )}

      {isQrDisplayOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Patient QR Code</p>
                <h3 className="text-lg font-bold text-slate-900">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrDisplayOpen(false)}
                className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
                <QRCode value={`VEMTAP:${selectedPatient.id}`} size={200} />
              </div>

              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Patient code</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-800">{selectedPatient.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
