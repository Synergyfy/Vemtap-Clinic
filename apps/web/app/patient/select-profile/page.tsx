"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { setActivePatientProfile } from "@/lib/api";
import { isFamilyOwner } from "@/lib/patient-family";
import {
  patientPortalService,
  type FamilyProfile,
  type FamilyProfilesResponse,
} from "@/services/patient-portal.service";

const getInitials = (profile: Pick<FamilyProfile, "firstName" | "lastName" | "fullName">) => {
  const first = profile.firstName?.trim().charAt(0) ?? "";
  const last = profile.lastName?.trim().charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || profile.fullName?.trim().charAt(0).toUpperCase() || "?";
};

const formatRelationship = (relationship?: string) => {
  if (!relationship) return "Dependent";
  return relationship.charAt(0).toUpperCase() + relationship.slice(1);
};

const Avatar = ({ profile, size }: { profile: FamilyProfile; size: "lg" | "md" }) => (
  <div
    className={`${
      size === "lg" ? "w-14 h-14 text-lg" : "w-12 h-12 text-sm"
    } rounded-full bg-[#d9e2ff] text-[#0055c4] font-bold flex items-center justify-center shrink-0 ring-2 ring-white`}
  >
    {getInitials(profile)}
  </div>
);

export default function SelectProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [family, setFamily] = useState<FamilyProfilesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [inviteSendingId, setInviteSendingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [inviteNotice, setInviteNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isFamilyMember = Boolean(
    user?.guardianId || user?.guardianRelationship === "guardian" || user?.accountType === "guardian",
  );

  // The family owner manages the family; dependents never see these actions.
  const canManageInvites = isFamilyOwner(user);

  useEffect(() => {
    let isActive = true;

    patientPortalService
      .getFamilyProfiles()
      .then((data) => {
        if (!isActive) return;
        setFamily(data);

        let storedId: string | null = null;
        try {
          const raw = localStorage.getItem("vemtap_active_profile");
          if (raw) {
            const parsed = JSON.parse(raw);
            storedId = typeof parsed === "string" ? parsed : parsed?.id ?? null;
          }
        } catch {
          storedId = null;
        }

        const profiles = [data?.primary, ...(data?.members ?? [])].filter(
          (profile): profile is FamilyProfile => Boolean(profile),
        );
        const preferred =
          profiles.find((profile) => profile.id === storedId) ?? data?.primary ?? data?.members?.[0] ?? null;
        setSelectedId((current) => current || preferred?.id || "");
      })
      .catch((error: any) => {
        if (!isActive) return;
        setErrorMessage(error?.response?.data?.message || "Unable to load your family profiles right now.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectableProfiles = useMemo(
    () => [family?.primary, ...(family?.members ?? [])].filter((profile): profile is FamilyProfile => Boolean(profile)),
    [family],
  );

  const selectedProfile = selectableProfiles.find((profile) => profile.id === selectedId) ?? family?.primary ?? null;
  const linkedCount = selectableProfiles.length;

  // "Add family" belongs to the owner's own profile only, so selecting a family
  // member hides it everywhere.
  const canAddFamily = canManageInvites && Boolean(selectedProfile?.isPrimary);

  const handleContinue = () => {
    if (!selectedProfile) return;

    setIsSwitching(true);
    setActivePatientProfile({
      id: selectedProfile.id,
      name: formatRelationship(selectedProfile.relationship),
      fullName: selectedProfile.fullName,
      role: selectedProfile.isPrimary ? "Primary Holder" : "Dependent",
    });

    setTimeout(() => {
      setIsSwitching(false);
      router.push("/patient/dashboard");
    }, 600);
  };

  const handleSendInvite = async (member: FamilyProfile) => {
    if (!member.email) {
      setInviteNotice({ type: "error", message: "Add an email address for this family member first." });
      return;
    }

    setInviteSendingId(member.id);
    setInviteNotice(null);

    try {
      const result = await patientPortalService.sendFamilyMemberInvite(member.id);
      setInvitedIds((ids) => (ids.includes(member.id) ? ids : [...ids, member.id]));
      setInviteNotice({
        type: "success",
        message: `Activation invite sent to ${result.email || member.email}.`,
      });
    } catch (error: any) {
      setInviteNotice({
        type: "error",
        message: error?.response?.data?.message || "Unable to send the invite right now.",
      });
    } finally {
      setInviteSendingId(null);
    }
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
                {isFamilyMember ? "Family Linked" : `${linkedCount} Profiles Linked`}
              </span>
            </div>
            <p className="text-sm text-[#424655]">
              {isFamilyMember
                ? "This account is linked to a guardian profile. You can switch between your family-linked records here."
                : "Select profile for records, appointments & prescriptions"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canAddFamily && (
              <Link
                href="/patient/family/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0055c4] text-white text-xs font-bold shadow-sm hover:bg-[#1759c4] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Add Family Member</span>
              </Link>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-[#ffdad6] bg-[#fff4f3] px-4 py-3 text-sm text-[#93000a]">
            {errorMessage}
          </div>
        )}

        {inviteNotice && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              inviteNotice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-[#ffdad6] bg-[#fff4f3] text-[#93000a]"
            }`}
          >
            {inviteNotice.message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((key) => (
              <div key={key} className="h-28 rounded-2xl bg-white border border-[#c2c6d7]/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Section 1: Primary Account Holder */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#424655] uppercase tracking-wider font-bold">Primary Profile</span>
                <span className="text-xs text-[#0055c4] font-semibold bg-[#e6f4fe] px-2.5 py-0.5 rounded-full">
                  Guardian Account
                </span>
              </div>

              {family?.primary ? (
                <div
                  className={`relative rounded-2xl bg-white p-5 transition-all duration-200 cursor-pointer ${
                    selectedId === family.primary.id
                      ? "border-2 border-[#0055c4] shadow-[0_8px_24px_rgba(0,85,196,0.08)] ring-4 ring-[#0055c4]/10"
                      : "border border-[#c2c6d7]/50 hover:border-[#0055c4]/40 shadow-sm"
                  }`}
                  onClick={() => setSelectedId(family.primary!.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar profile={family.primary} size="lg" />
                        {selectedId === family.primary.id && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0055c4] flex items-center justify-center text-white ring-2 ring-white">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[18px] text-[#131b2e] font-bold truncate">{family.primary.fullName}</span>
                        <div className="flex items-center gap-2 text-sm text-[#424655] flex-wrap">
                          <span className="font-semibold text-[#0055c4]">Primary profile</span>
                          <span>•</span>
                          <span className="truncate">{family.primary.email || "No email on file"}</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full text-xs">
                            Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        selectedId === family.primary.id
                          ? "border-2 border-[#0055c4] bg-[#0055c4] text-white"
                          : "border-2 border-[#c2c6d7]/80 text-transparent"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff]/80 border border-[#e2e7ff]/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#0055c4]/10 text-[#0055c4] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm text-[#131b2e] truncate font-bold">
                          Selected patient account
                        </span>
                        <span className="text-xs text-[#424655] truncate">Clinic profile • account active</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#727786] text-[18px] shrink-0">chevron_right</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#c2c6d7] bg-white p-5 text-sm text-[#424655]">
                  Your primary profile could not be loaded.
                </div>
              )}
            </div>

            {/* Section 2: Family & Linked Dependents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#424655] uppercase tracking-wider font-bold">Family Dependents</span>
                <span className="text-xs text-[#424655] font-semibold">
                  {family?.members.length ?? 0} Linked {(family?.members.length ?? 0) === 1 ? "Profile" : "Profiles"}
                </span>
              </div>

              {family?.members.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {family.members.map((member) => {
                    const isSelected = selectedId === member.id;
                    return (
                      <div
                        key={member.id}
                        className={`relative rounded-2xl bg-white p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-2 border-[#0055c4] shadow-[0_8px_24px_rgba(0,85,196,0.08)] ring-4 ring-[#0055c4]/10"
                            : "border border-[#c2c6d7]/50 hover:border-[#0055c4]/40 shadow-sm"
                        }`}
                        onClick={() => setSelectedId(member.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative shrink-0">
                              <Avatar profile={member} size="md" />
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
                                <span className="text-base text-[#131b2e] font-bold truncate">{member.fullName}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                    member.status === "active"
                                      ? "bg-[#d9e2ff] text-[#001945]"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[11px]">
                                    {member.status === "active" ? "schedule" : "person_add"}
                                  </span>
                                  {member.status === "active" ? "Ready" : "Added"}
                                </span>
                              </div>
                              <div className="text-xs text-[#424655] font-medium mt-0.5">
                                {formatRelationship(member.relationship)} · {member.email || "No email on file"}
                              </div>
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
                              child_care
                            </span>
                            <span className="text-xs text-[#131b2e] font-semibold truncate">
                              {member.status === "active"
                                ? "Family account profile"
                                : "Added by guardian · portal not activated"}
                            </span>
                          </div>
                          {member.status !== "active" ? (
                            canManageInvites ? (
                              <button
                                className="px-3 py-1 rounded-lg text-xs font-bold shrink-0 bg-[#0055c4] text-white hover:bg-[#1759c4] transition-colors flex items-center gap-1 disabled:opacity-70"
                                disabled={inviteSendingId === member.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleSendInvite(member);
                                }}
                                type="button"
                              >
                                <span
                                  className={`material-symbols-outlined text-[14px] ${
                                    inviteSendingId === member.id ? "animate-spin" : ""
                                  }`}
                                >
                                  {inviteSendingId === member.id ? "progress_activity" : "mail"}
                                </span>
                                {inviteSendingId === member.id
                                  ? "Sending..."
                                  : invitedIds.includes(member.id)
                                    ? "Resend invite"
                                    : "Send invite"}
                              </button>
                            ) : (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold shrink-0 bg-[#dae2fd] text-[#0055c4]">
                                Added
                              </span>
                            )
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${
                                isSelected ? "bg-[#0055c4] text-white" : "bg-[#dae2fd] text-[#0055c4]"
                              }`}
                            >
                              {isSelected ? "Active" : "Select"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#c2c6d7]/70 bg-white p-5 text-sm text-[#424655]">
                  No family members have activated their accounts yet. Invite one below.
                </div>
              )}

              {/* Pending invitations: invited but not yet activated */}
              {family?.pendingInvites.length ? (
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-[#727786] uppercase tracking-wider font-bold px-1">
                    Pending Invitations
                  </span>
                  {family.pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-2xl bg-[#f8f9ff] border border-[#c2c6d7]/40 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar profile={invite} size="md" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-[#131b2e] font-bold truncate">{invite.fullName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 bg-amber-50 text-amber-700">
                              <span className="material-symbols-outlined text-[11px]">mail</span>
                              Awaiting activation
                            </span>
                          </div>
                          <span className="text-xs text-[#424655] truncate">
                            {formatRelationship(invite.relationship)} · {invite.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#727786] font-semibold shrink-0">Invite sent</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Add Family Member Dashed Tile */}
              {canAddFamily && (
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
              )}
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
                disabled={isSwitching || !selectedProfile}
                onClick={handleContinue}
                type="button"
              >
                {isSwitching ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Switching profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    <span>
                      Continue as {selectedProfile ? selectedProfile.firstName || selectedProfile.fullName : "profile"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
