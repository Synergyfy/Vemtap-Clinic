"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  User, Mail, Shield, Building2, Key, 
  Loader2, AlertCircle, CheckCircle2, LogOut,
  Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/auth/profile");
      setProfile(response.data);
    } catch (err: any) {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully. Please log in again.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
      
      // After password change, all sessions are revoked, so logout
      setTimeout(() => {
        handleLogout();
      }, 3000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "System Administrator",
      doctor: "Doctor",
      nurse: "Nurse",
      optometrist: "Optometrist",
      pharmacist: "Pharmacist",
      receptionist: "Receptionist",
      cashier: "Cashier",
      patient: "Patient",
    };
    return labels[role] || role;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue" />
      </main>
    );
  }

  const primaryRole = user?.roles?.[0] ?? "user";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-navy">Profile Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700" role="alert">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700" role="alert">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-brand-soft-blue flex items-center justify-center">
                  <User size={32} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-navy">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-slate-500 text-sm">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Shield className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Role</p>
                    <p className="text-sm font-bold text-brand-navy">{getRoleLabel(primaryRole)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Clinic ID</p>
                    <p className="text-sm font-bold text-brand-navy truncate">{user?.clinicId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Email</p>
                    <p className="text-sm font-bold text-brand-navy truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Key className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">User ID</p>
                    <p className="text-sm font-bold text-brand-navy truncate">{user?.userId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <Button 
                  variant="default" 
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-brand-navy mb-6">Account Information</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">First Name</dt>
                  <dd className="text-sm font-medium text-brand-navy">{profile?.firstName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Last Name</dt>
                  <dd className="text-sm font-medium text-brand-navy">{profile?.lastName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Email</dt>
                  <dd className="text-sm font-medium text-brand-navy">{profile?.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Phone</dt>
                  <dd className="text-sm font-medium text-brand-navy">{profile?.phone ?? "Not set"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Clinic ID</dt>
                  <dd className="text-sm font-medium text-brand-navy">{user?.clinicId}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">User ID</dt>
                  <dd className="text-sm font-medium text-brand-navy font-mono text-xs">{user?.userId}</dd>
                </div>
              </dl>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-brand-navy">Change Password</h3>
                <Button
                  variant={showPasswordChange ? "default" : "outline"}
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-sm"
                >
                  {showPasswordChange ? "Cancel" : "Change Password"}
                </Button>
              </div>

              {showPasswordChange && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm" role="alert">
                      <AlertCircle size={16} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Current Password</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="••••••••"
                        required
                        disabled={isChangingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        disabled={isChangingPassword}
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="••••••••"
                        required
                        disabled={isChangingPassword}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        disabled={isChangingPassword}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        placeholder="••••••••"
                        required
                        disabled={isChangingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        disabled={isChangingPassword}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      disabled={isChangingPassword}
                      type="submit"
                    >
                      {isChangingPassword ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin" />
                          Changing...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowPasswordChange(false)}
                      disabled={isChangingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Sessions Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-brand-navy mb-4">Active Sessions</h3>
              <p className="text-sm text-slate-500 mb-4">
                Changing your password will revoke all active sessions across all devices for security.
              </p>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft-blue flex items-center justify-center">
                      <Shield size={20} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-navy">Current Session</p>
                      <p className="text-sm text-slate-500">This device</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}