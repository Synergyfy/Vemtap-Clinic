"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";

type FilterType = "all" | "hmo" | "private" | "pediatric" | "branch";
type ViewMode = "cards" | "table";

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

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

export default function ReceptionPatientDirectoryPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: patientResponse, isLoading, isError } = usePatients({
    clinicId: user?.clinicId ?? "",
    page: currentPage,
    limit: 12,
  });

  const patients = patientResponse?.data ?? [];
  const totalPatients = patientResponse?.total ?? patients.length;
  const totalPages = patientResponse?.totalPages ?? 1;

  const counts = useMemo(
    () => ({
      all: totalPatients,
      hmo: patients.filter((patient) => patient.patientType === "hmo").length,
      private: patients.filter((patient) => patient.patientType === "private").length,
      pediatric: patients.filter((patient) => calculateAge(patient.dateOfBirth) < 18).length,
      branch: patients.filter((patient) => !!patient.branchId).length,
    }),
    [patients, totalPatients],
  );

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        query.length === 0 ||
        `${patient.firstName} ${patient.lastName} ${patient.id} ${patient.phone ?? ""}`
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "hmo" && patient.patientType === "hmo") ||
        (activeFilter === "private" && patient.patientType === "private") ||
        (activeFilter === "pediatric" && calculateAge(patient.dateOfBirth) < 18) ||
        (activeFilter === "branch" && !!patient.branchId);

      return matchesSearch && matchesFilter;
    });
  }, [patients, activeFilter, searchQuery]);

  return (
    <div className="min-h-full bg-surface text-on-surface flex flex-col font-sans pb-16">
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:gap-4">
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-on-surface tracking-tight">
                Unified Patient Registry
              </h2>
              <p className="text-[11px] sm:text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-primary font-bold">{totalPatients}</span> Registered across network
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  aria-label="List view"
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
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-colors flex items-center justify-center ${
                    viewMode === "cards"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                </button>
              </div>

              <Link
                href="/reception/patients/register"
                className="h-7 sm:h-8 px-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">person_add</span>
                <span>New Patient</span>
              </Link>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-2.5 sm:p-3 shadow-xs border border-surface-container flex flex-col gap-2">
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
                className="w-full h-8 sm:h-9 pl-8 pr-4 rounded-lg bg-surface-container text-on-surface placeholder:text-on-surface-variant text-xs sm:text-[13px] focus:outline-none focus:bg-surface-container-lowest focus:ring-1.5 focus:ring-primary/20 border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {[
                { key: "all", label: "All", count: counts.all },
                { key: "hmo", label: "HMO", count: counts.hmo },
                { key: "private", label: "Private", count: counts.private },
                { key: "pediatric", label: "Pediatric", count: counts.pediatric },
                { key: "branch", label: "Branch", count: counts.branch },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key as FilterType)}
                  className={`whitespace-nowrap h-6 sm:h-7 px-2.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ${
                    activeFilter === filter.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`px-1 py-0.1 rounded-full text-[9px] ${
                      activeFilter === filter.key ? "bg-white/20" : "bg-black/5"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {isLoading ? (
            <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
              Loading patient registry...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-error/30 bg-error-container/20 p-6 text-center text-sm text-on-error-container">
              Unable to load patient records right now.
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
              No patients match the current search and filter.
            </div>
          ) : viewMode === "cards" ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {filteredPatients.map((patient) => {
                const age = calculateAge(patient.dateOfBirth);
                const initials = getInitials(`${patient.firstName} ${patient.lastName}`);
                const displayInsurance = patient.hmoName ?? (patient.patientType === "hmo" ? "HMO Patient" : "Private Patient");

                return (
                  <article
                    key={patient.id}
                    className="rounded-xl bg-surface-container-lowest p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all border border-surface-container flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-inner">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs sm:text-sm text-on-surface font-bold truncate">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <span className="text-[11px] text-on-surface-variant">
                              ({age}y · {patient.gender})
                            </span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
                            <span className="text-primary font-bold">#{patient.id.slice(0, 8).toUpperCase()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px] text-secondary">verified_user</span>
                        {displayInsurance}
                      </span>
                      {patient.phone && (
                        <a
                          href={`tel:${patient.phone}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold hover:text-primary transition-colors text-[10px]"
                        >
                          <span className="material-symbols-outlined text-[12px] text-primary">call</span>
                          {patient.phone}
                        </a>
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tertiary"></span>
                        </span>
                        <div className="truncate">
                          <p className="text-xs text-on-surface font-bold truncate">
                            {patient.status === "active" ? "Active patient" : patient.status === "new" ? "New registration" : "Inactive record"}
                          </p>
                          <p className="text-[10px] text-on-surface-variant truncate">
                            {patient.email ?? patient.phone ?? "No contact details saved"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold shrink-0 capitalize">
                        {patient.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-surface-container">
                      <Link
                        href={`/clinic/patients/${patient.id}`}
                        className="col-span-6 h-7 sm:h-8 px-2 rounded-lg bg-surface-container text-on-surface font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors active:scale-95 text-[11px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        <span>View Profile</span>
                      </Link>
                      <Link
                        href={`/reception/check-in?patientId=${patient.id}`}
                        className="col-span-6 h-7 sm:h-8 px-2 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center gap-1 hover:bg-primary-hover transition-colors active:scale-95 text-[11px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                        <span>Check-In</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[40rem] sm:min-w-full">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Patient & ID</th>
                      <th className="py-2.5 px-3">Demographics</th>
                      <th className="py-2.5 px-3">Payer / Insurance</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-xs">
                    {filteredPatients.map((patient) => {
                      const age = calculateAge(patient.dateOfBirth);
                      const initials = getInitials(`${patient.firstName} ${patient.lastName}`);

                      return (
                        <tr key={patient.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-on-surface text-xs">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="font-mono text-primary text-[10px] font-semibold">
                                  #{patient.id.slice(0, 8).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>
                              {patient.gender}, {age} yrs
                            </div>
                            <div className="text-[10px] text-on-surface-variant capitalize">
                              {patient.patientType}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px]">
                              {patient.hmoName ?? "Private"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>{patient.phone ?? "—"}</div>
                            <div className="text-[10px] text-on-surface-variant">{patient.email ?? "No email"}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] capitalize">
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/clinic/patients/${patient.id}`}
                                className="px-2 py-1 rounded-md bg-surface-container text-on-surface font-semibold text-[11px] hover:bg-surface-container-high transition-colors"
                              >
                                Profile
                              </Link>
                              <Link
                                href={`/reception/check-in?patientId=${patient.id}`}
                                className="px-2 py-1 rounded-md bg-primary text-on-primary font-bold text-[11px] hover:bg-primary-hover transition-colors"
                              >
                                Check-In
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <footer className="pt-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[17px]">groups</span>
                <span className="text-on-surface font-medium truncate text-xs">
                  Showing <strong className="text-on-surface">{filteredPatients.length}</strong> of <strong className="text-on-surface">{totalPatients}</strong> patients
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  aria-label="Previous page"
                  className="w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="px-2 text-on-surface font-bold text-[11px]">
                  {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  aria-label="Next page"
                  className="w-7 h-7 rounded-lg bg-surface-container text-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high active:scale-95 transition-all"
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
