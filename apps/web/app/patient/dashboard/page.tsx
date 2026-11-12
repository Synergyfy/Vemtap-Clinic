"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePatientClinicMemberships, usePatientProfile, usePatientAppointmentsList } from "@/hooks/usePatientPortal";
import { useAuth } from "@/lib/auth-context";
import { isFamilyOwner } from "@/lib/patient-family";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = usePatientProfile();
  const { data: memberships = [], isLoading: membershipsLoading } = usePatientClinicMemberships();
  const { data: appointments = [] } = usePatientAppointmentsList();

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  useEffect(() => {
    if (!memberships.length) {
      setSelectedClinicId(null);
      return;
    }

    if (!selectedClinicId || !memberships.some((membership) => membership.clinicId === selectedClinicId)) {
      setSelectedClinicId(memberships[0]?.clinicId ?? null);
    }
  }, [memberships, selectedClinicId]);

  const selectedMembership = useMemo(
    () => memberships.find((membership) => membership.clinicId === selectedClinicId) ?? memberships[0] ?? null,
    [memberships, selectedClinicId],
  );

  const clinicAppointments = useMemo(
    () =>
      selectedMembership
        ? appointments.filter((appointment) => appointment.clinicId === selectedMembership.clinicId)
        : appointments,
    [appointments, selectedMembership],
  );

  const nextAppointment = clinicAppointments[0] ?? null;
  const selectedClinicName = selectedMembership?.clinic?.name ?? selectedMembership?.clinic?.clinicName ?? "Your clinic";
  const selectedBranchName = selectedMembership?.branch?.name ?? selectedMembership?.branch?.branchName ?? "Primary branch";

  const patientName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim()
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
    || profile?.email
    || user?.email
    || "";

  const isGuardianProfile = Boolean(
    user?.guardianRelationship === 'guardian' ||
    user?.accountType === 'guardian' ||
    profile?.guardianRelationship === 'guardian' ||
    profile?.accountType === 'guardian'
  );

  // Adding family members belongs to the family owner's own profile only: a
  // dependent login, or the owner viewing a dependent, never shows it.
  const canManageFamily = isFamilyOwner(user) && Boolean(profile) && !profile?.guardianId;

  const dashboardProfileLabel = isGuardianProfile ? 'Family profile' : 'Patient profile';

  return (
    <div className="w-full text-[#0F2942] antialiased selection:bg-blue-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-[#E9F1F7]/70 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)]">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-[#73889B] uppercase">Welcome Back</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2942] leading-tight mt-0.5">
            {profileLoading ? "Good morning..." : patientName ? `Good morning, ${patientName}` : "Good morning"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F9FD] rounded-full border border-[#E2EBF2] shadow-sm shrink-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isGuardianProfile ? 'bg-violet-500' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-bold text-[#0F2942] font-mono tracking-tight">{dashboardProfileLabel}</span>
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

      {canManageFamily && (
        <div className="mb-6 bg-gradient-to-r from-violet-50 via-indigo-50 to-white rounded-2xl border border-violet-100 p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(16,24,40,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Family account</p>
              <h2 className="mt-1 text-lg font-bold text-[#0F2942]">Manage your dependents and shared records</h2>
              <p className="mt-1 text-sm text-[#5E6783]">Link children, spouses, or parents under your guardian profile.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/patient/family/add"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0055C4] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0047A6] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">group_add</span>
                Add family member
              </Link>
              <Link
                href="/patient/select-profile"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D9E2FF] bg-white px-3.5 py-2 text-xs font-bold text-[#0F2942] hover:bg-[#F4F9FD] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">switch_account</span>
                View family profiles
              </Link>
            </div>
          </div>
        </div>
      )}

      {memberships.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-[#E9F1F7]/70 p-4 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#73889B]">Clinic access</p>
              <h2 className="text-lg font-bold text-[#0F2942]">{selectedClinicName}</h2>
              <p className="text-sm text-[#73889B]">{selectedBranchName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {memberships.map((membership) => {
                const clinicName = membership.clinic?.name ?? membership.clinic?.clinicName ?? "Clinic";
                const branchName = membership.branch?.name ?? membership.branch?.branchName ?? "Branch";
                const isActive = membership.clinicId === selectedClinicId;
                return (
                  <button
                    key={membership.id}
                    type="button"
                    onClick={() => setSelectedClinicId(membership.clinicId)}
                    className={`rounded-full px-3 py-2 text-xs font-bold border transition-colors ${
                      isActive
                        ? "bg-[#0055C4] text-white border-[#0055C4]"
                        : "bg-[#F4F9FD] text-[#0F2942] border-[#E2EBF2] hover:bg-[#EAF4FF]"
                    }`}
                  >
                    {clinicName} • {branchName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-[#0F2942]">
                Upcoming Appointments
              </h2>
              <span className="text-[11px] font-bold text-[#0055C4] bg-[#E6F4FE] px-2.5 py-0.5 rounded-full">
                {nextAppointment ? "Confirmed" : "No upcoming visit"}
              </span>
            </div>

            {membershipsLoading ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E9F1F7]/70 text-sm text-[#73889B]">
                Loading your clinic memberships...
              </div>
            ) : nextAppointment ? (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#EDF5FF] overflow-hidden shrink-0 ring-2 ring-[#F2F7FC] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-[#0055C4]">medical_services</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-bold text-[#0F2942] truncate leading-snug">
                        {nextAppointment.type || "Consultation"}
                      </h3>
                      <p className="text-[12px] font-bold text-[#0055C4] truncate">
                        {selectedClinicName}
                      </p>
                      <p className="text-[12px] font-medium text-[#73889B] truncate mt-0.5">
                        {nextAppointment.reason || `Visit at ${selectedBranchName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 text-xs text-[#73889B]">
                    <div className="flex items-center gap-1 font-semibold text-[#0F2942]">
                      <span className="material-symbols-outlined text-[16px] text-[#0055C4]">calendar_today</span>
                      <span>{new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium mt-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{nextAppointment.appointmentTime || "Time scheduled"}</span>
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
                  <Link
                    className="w-full sm:flex-1 py-2 rounded-xl text-white text-[12px] font-bold text-center transition-colors shadow-sm bg-[#0055C4] hover:bg-[#0047A6]"
                    href="/patient/appointments"
                  >
                    View Appointments
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-[#E9F1F7]/70 text-sm text-[#73889B]">
                No appointments are currently linked to {selectedClinicName}. Book a visit to get started.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-[#0F2942]">
                Quick access
              </h3>
              <Link className="text-[12px] font-bold text-[#0055C4] hover:underline" href="/patient/records">
                Open records
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/patient/appointments" className="rounded-xl border border-[#E9F1F7] bg-[#F4F9FD] p-3 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#73889B]">Appointments</p>
                <p className="mt-2 text-sm font-bold text-[#0F2942]">{clinicAppointments.length}</p>
              </Link>
              <Link href="/patient/records" className="rounded-xl border border-[#E9F1F7] bg-[#F4F9FD] p-3 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#73889B]">Records</p>
                <p className="mt-2 text-sm font-bold text-[#0F2942]">{profile ? "Available" : "—"}</p>
              </Link>
              <Link href="/patient/billing" className="rounded-xl border border-[#E9F1F7] bg-[#F4F9FD] p-3 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#73889B]">Billing</p>
                <p className="mt-2 text-sm font-bold text-[#0F2942]">{selectedClinicName}</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5 lg:space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#73889B]">Selected clinic</p>
            <h3 className="mt-2 text-xl font-bold text-[#0F2942]">{selectedClinicName}</h3>
            <p className="mt-1 text-sm text-[#73889B]">{selectedBranchName}</p>
            <Link
              className="mt-4 block w-full py-2.5 rounded-xl bg-[#0055C4] text-white text-[12px] font-bold text-center hover:bg-[#0047A6] transition-colors"
              href="/patient/appointments"
            >
              Book Visit
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] border border-[#E9F1F7]/70">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[14px] font-bold text-[#0F2942]">Clinic access</h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {memberships.length} active
              </span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-[#73889B]">
              {memberships.length > 0 ? (
                memberships.map((membership) => (
                  <div key={membership.id} className="rounded-xl border border-[#E9F1F7] bg-[#F4F9FD] px-3 py-2">
                    <p className="font-bold text-[#0F2942]">{membership.clinic?.name ?? membership.clinic?.clinicName ?? "Clinic"}</p>
                    <p>{membership.branch?.name ?? membership.branch?.branchName ?? "Branch"}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-[#D8E6F3] bg-[#F9FBFE] px-3 py-4 text-sm text-[#73889B]">
                  No clinic memberships yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
