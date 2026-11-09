"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatient } from "@/hooks/usePatients";

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export default function ClinicalPatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: patient, isLoading, isError } = usePatient(patientId ?? null);
  const [copiedId, setCopiedId] = useState(false);

  const initials = useMemo(() => {
    if (!patient) return "P";
    return `${patient.firstName ?? ""} ${patient.lastName ?? ""}`
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P";
  }, [patient]);

  const handleCopyId = async () => {
    if (!patient) return;
    await navigator.clipboard.writeText(patient.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-surface p-8 text-center text-sm text-on-surface-variant">
        Loading patient record...
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="min-h-full bg-surface p-8 text-center text-sm text-on-surface-variant">
        Patient record not found.
      </div>
    );
  }

  const patientDisplayId = `#${patient.id.slice(0, 8).toUpperCase()}`;
  const insuranceText = patient.hmoName
    ? `${patient.hmoName}${patient.hmoNumber ? ` • ${patient.hmoNumber}` : ""}`
    : "Private patient";

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-16">
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 shadow-xs border border-surface-container flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h2 className="text-sm sm:text-base text-on-surface font-bold truncate">
                      {patient.firstName} {patient.lastName}
                    </h2>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] capitalize">
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {patient.gender}, {calculateAge(patient.dateOfBirth)} yrs
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-low text-primary text-[10px] font-mono hover:bg-surface-container transition-colors border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[11px]">tag</span>
                      <span className="font-bold">{copiedId ? "Copied!" : patientDisplayId}</span>
                      <span className="material-symbols-outlined text-[10px] text-outline">content_copy</span>
                    </button>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] border border-surface-container">
                      {patient.patientType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-lg p-3 flex items-center gap-2 border border-surface-container">
                <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface font-bold truncate">Insurance</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{insuranceText}</p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
              </div>

              <div className="pt-1.5 flex flex-col gap-2 border-t border-surface-container">
                <div className="flex items-center justify-between text-on-surface-variant text-xs gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[14px] text-primary">phone</span>
                    <a href={`tel:${patient.phone ?? ""}`} className="hover:text-primary transition-colors text-on-surface font-semibold truncate">
                      {patient.phone ?? "No phone number"}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant text-[11px] min-w-0">
                    <span className="material-symbols-outlined text-[13px] text-outline">alternate_email</span>
                    <span className="truncate">{patient.email ?? "No email"}</span>
                  </div>
                </div>

                {patient.address && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container text-on-surface border border-surface-container-high text-[11px]">
                    <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">location_on</span>
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-12 gap-2 pt-1.5 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => router.push("/clinic/appointments")}
                  className="col-span-6 h-9 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-primary-hover transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  <span>New Consult</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/reception/appointments")}
                  className="col-span-3 h-9 bg-surface-container text-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
                  <span>Book</span>
                </button>
                <a
                  href={`tel:${patient.phone ?? ""}`}
                  className="col-span-3 h-9 bg-surface-container text-on-surface rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container">
              <h3 className="text-sm font-bold text-on-surface">Patient summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-on-surface-variant">
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Gender</div>
                  <div className="mt-1 font-semibold text-on-surface capitalize">{patient.gender ?? "Not specified"}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Age</div>
                  <div className="mt-1 font-semibold text-on-surface">{calculateAge(patient.dateOfBirth)} years</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Status</div>
                  <div className="mt-1 font-semibold text-on-surface capitalize">{patient.status}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Type</div>
                  <div className="mt-1 font-semibold text-on-surface capitalize">{patient.patientType}</div>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">
                <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Address</div>
                <div className="mt-1 font-semibold text-on-surface">{patient.address ?? "No address saved"}</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-on-surface">Care overview</h3>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Active record</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Branch ID</div>
                  <div className="mt-1 font-semibold text-on-surface">{patient.branchId ?? "Primary branch"}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                  <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Clinical status</div>
                  <div className="mt-1 font-semibold text-on-surface">{patient.status ?? "In review"}</div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">
                <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">Most recent note</div>
                <p className="mt-2 text-on-surface font-medium leading-relaxed">
                  Patient care is tracked in the current clinical record and updated as consultations, prescriptions, and follow-up actions are completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
