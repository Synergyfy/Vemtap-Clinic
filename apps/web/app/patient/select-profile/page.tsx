"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Profile {
  id: string;
  name: string;
  fullName: string;
  role: string;
  details: string;
  badge?: { text: string; icon: string; type: "error" | "secondary" | "primary" };
  visitInfo: { icon: string; text: string; subtext?: string };
  image: string;
  isPrimary?: boolean;
}

const PROFILES: Profile[] = [
  {
    id: "p1",
    name: "Primary",
    fullName: "Primary Account Holder",
    role: "Primary Holder",
    details: "Primary patient profile",
    visitInfo: {
      icon: "calendar_today",
      text: "Selected patient account",
      subtext: "Clinic profile • account active",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA4yrohSgI6-TWXFUzqtaretv3OnzerWL8EF3feZvcl-Ml3uJIVY4wSTvgbyc1v59zl-f0-aZgODg9bZTMfPx0LkqfPjYcBEMEfOuxJ_Y7TBjUHuSqODO1EFbw9FsS4lv3iHqCkwQxIi5RroIVVDcCPIqahf8R1CWOwE1wpPOjoHTTwfVHXxm_RtbU-P8T_vZZRvix7bgXwo2DWbToQ0_zbmJMMgh4tUCRQeMUPOtQS",
    isPrimary: true,
  },
  {
    id: "p2",
    name: "Dependent",
    fullName: "Dependent Profile 1",
    role: "Dependent",
    details: "Family linked profile",
    badge: { text: "Ready", icon: "schedule", type: "secondary" },
    visitInfo: {
      icon: "child_care",
      text: "Family account profile",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDvNsi13bmcrozDMaDJZF96d6imSCThoiducW2Dc0xI66NLA4pwr1_k7RrMGj1Am4FBSvAHiew5Lhzlr8ve0dk0HxIwgGEvgsO5QQ55nNXUmYdNlGcgVdLadlh2zRk0_9grLHl42ZfBjUOswk-1Vz_1eZBjQLCK35LpDWsunw_XtSmHNZgLL_Q5-nowOf8ZSAeJMbLfEg0fBjjBl2bjCJnwFnCfeXQtM8YaM4o8oFf",
  },
  {
    id: "p3",
    name: "Dependent",
    fullName: "Dependent Profile 2",
    role: "Dependent",
    details: "Family linked profile",
    badge: { text: "Ready", icon: "eyeglasses", type: "secondary" },
    visitInfo: {
      icon: "eyeglasses",
      text: "Account ready for appointment",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtKwYoejhj1khuGSH3dyG5YZRh2HeF0ECTkBdGhN2UAVSpigawDPTZezREEeaeI9sGyZB2lR2ZBw15FP8FVFfVESnThMK55stP4CK2SbVB37yuJtw47v5pmnO5BR5jHOwJ4H3etbAi09eyoUGBo17RwzQhxNL2lM8vc_DT8gY0sgEH8tRlqPmXngwz4ZCYWXdSn-0-_Rt9x4F3eSmxMzfEGVLt7AURblYcTPBqy3Z8",
  },
];

export default function SelectProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("p1");
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const isFamilyMember = Boolean(
    user?.guardianId ||
    user?.guardianRelationship === 'guardian' ||
    user?.accountType === 'guardian'
  );
  const selectedProfile = PROFILES.find((p) => p.id === selectedId) || PROFILES[0];

  const handleContinue = () => {
    setIsSwitching(true);
    try {
      localStorage.setItem("vemtap_active_profile", JSON.stringify(selectedProfile));
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSwitching(false);
      router.push("/patient/dashboard");
    }, 600);
  };

  return (
    <div className="w-full text-[#131b2e] antialiased selection:bg-[#0055c4]/20 font-[Inter,sans-serif]">
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-24 lg:pb-8">
        {/* Header Intro */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2e7ff]/60 shadow-[0_8px_30px_-4px_rgba(12,38,70,0.05)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
                Who is visiting today?
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e2e7ff] text-[#0055c4] text-xs font-bold">
                {isFamilyMember ? "Family Linked" : `${PROFILES.length} Profiles Linked`}
              </span>
            </div>
            <p className="text-sm text-[#424655]">
              {isFamilyMember
                ? "This account is linked to a guardian profile. You can switch between your family-linked records here."
                : "Select profile for records, appointments & prescriptions"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/patient/family/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0055c4] text-white text-xs font-bold shadow-sm hover:bg-[#1759c4] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add Family Member</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Primary Account Holder */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#424655] uppercase tracking-wider font-bold">
              Primary Profile
            </span>
            <span className="text-xs text-[#0055c4] font-semibold bg-[#e6f4fe] px-2.5 py-0.5 rounded-full">
              HMO Tier-1
            </span>
          </div>

          {/* Primary Profile Card */}
          {PROFILES.filter((p) => p.isPrimary).map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl bg-white p-5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#0055c4] shadow-[0_8px_24px_rgba(0,85,196,0.08)] ring-4 ring-[#0055c4]/10"
                    : "border border-[#c2c6d7]/50 hover:border-[#0055c4]/40 shadow-sm"
                }`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-14 h-14 rounded-full p-0.5 ring-2 ring-[#0055c4] shrink-0 bg-[#f2f3ff]">
                      <img
                        alt={`${p.fullName} profile portrait`}
                        className="w-full h-full object-cover rounded-full"
                        src={p.image}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0055c4] flex items-center justify-center text-white ring-2 ring-white">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[18px] text-[#131b2e] font-bold truncate">
                        {p.fullName}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-[#424655]">
                        <span className="font-semibold text-[#0055c4]">Primary profile</span>
                        <span>•</span>
                        <span>Active account</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full text-xs">
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-2 border-[#0055c4] bg-[#0055c4] text-white"
                          : "border-2 border-[#c2c6d7]/80 text-transparent"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  </div>
                </div>

                {/* Visit indicator pill */}
                <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff]/80 border border-[#e2e7ff]/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0055c4]/10 text-[#0055c4] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{p.visitInfo.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm text-[#131b2e] truncate font-bold">
                        {p.visitInfo.text}
                      </span>
                      {p.visitInfo.subtext && (
                        <span className="text-xs text-[#424655] truncate">
                          {p.visitInfo.subtext}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#727786] text-[18px] shrink-0">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 2: Family & Linked Dependents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#424655] uppercase tracking-wider font-bold">
              Family Dependents
            </span>
            <span className="text-xs text-[#424655] font-semibold">2 Linked Profiles</span>
          </div>

          {/* Dependents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROFILES.filter((p) => !p.isPrimary).map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl bg-white p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-2 border-[#0055c4] shadow-[0_8px_24px_rgba(0,85,196,0.08)] ring-4 ring-[#0055c4]/10"
                      : "border border-[#c2c6d7]/50 hover:border-[#0055c4]/40 shadow-sm"
                  }`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-12 h-12 rounded-full p-0.5 ring-1 ring-[#c2c6d7]/60 shrink-0 bg-[#f2f3ff]">
                        <img
                          alt={`${p.fullName} portrait`}
                          className="w-full h-full rounded-full object-cover"
                          src={p.image}
                        />
                        {isSelected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0055c4] flex items-center justify-center text-white ring-2 ring-white">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base text-[#131b2e] font-bold truncate">
                            {p.fullName}
                          </span>
                          {p.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                p.badge.type === "error"
                                  ? "bg-[#ffdad6]/70 text-[#93000a]"
                                  : "bg-[#d9e2ff] text-[#001945]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[11px]">{p.badge.icon}</span>
                              {p.badge.text}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#424655] font-medium mt-0.5">{p.details}</div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isSelected
                          ? "border-2 border-[#0055c4] bg-[#0055c4] text-white"
                          : "border-2 border-[#c2c6d7]/80 text-transparent"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff]/70">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[#0055c4] text-[18px] shrink-0">
                        {p.visitInfo.icon}
                      </span>
                      <span className="text-xs text-[#131b2e] font-semibold truncate">
                        {p.visitInfo.text}
                      </span>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#0055c4] text-white"
                          : "bg-[#dae2fd] text-[#0055c4]"
                      }`}
                      type="button"
                    >
                      {isSelected ? "Active" : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Family Member Dashed Tile */}
          <Link
            className="w-full rounded-2xl border-2 border-dashed border-[#0055c4]/30 hover:border-[#0055c4]/60 bg-[#f2f3ff]/40 hover:bg-[#f2f3ff] p-4 flex items-center justify-between text-left transition-all active:scale-[0.99] group mt-2"
            href="/patient/family/add"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#0055c4]/10 flex items-center justify-center text-[#0055c4] group-hover:bg-[#0055c4] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">group_add</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[#131b2e] group-hover:text-[#0055c4] transition-colors font-bold">
                  Add Family Member
                </span>
                <span className="text-xs text-[#424655]">
                  Link Child, Spouse, or Parent records under your guardian account
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#0055c4]/60 group-hover:text-[#0055c4] transition-colors text-[22px]">
              add_circle
            </span>
          </Link>
        </div>

        {/* Security & Privacy Badge */}
        <div className="flex items-center justify-center gap-2 py-2 text-center text-xs text-[#424655] font-medium">
          <span className="material-symbols-outlined text-[#006847] text-[18px]">verified_user</span>
          <span>Protected Health Records • End-to-end encrypted under NDPR healthcare protocols</span>
        </div>

        {/* CTA Bar */}
        <div className="pt-2">
          <button
            className="w-full sm:w-auto sm:min-w-[280px] mx-auto h-12 px-8 rounded-xl bg-[#0055c4] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1759c4] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75"
            disabled={isSwitching}
            onClick={handleContinue}
            type="button"
          >
            {isSwitching ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
                <span>Switching to {selectedProfile.name}...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">check</span>
                <span>Continue as {selectedProfile.name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
