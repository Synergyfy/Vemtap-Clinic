"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicStaff, clinicShifts as initialShifts, clinicRolePermissions as initialPermissions, formatNGN, type ClinicShift } from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";
import { cn } from "@/lib/utils";
import { CalendarDays, Users, ShieldCheck, TrendingUp, Clock, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";

type TabType = "team" | "shifts" | "permissions";

export default function StaffPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<TabType>("team");
  
  // Interactive State for Shifts
  const [roster, setRoster] = useState<ClinicShift[]>(initialShifts);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [newShift, setNewShift] = useState({
    staffName: clinicStaff[0]?.name || "",
    role: clinicStaff[0]?.role || "",
    day: "Monday",
    shift: "Morning" as const
  });

  // Interactive State for Permissions
  const [selectedRole, setSelectedRole] = useState(initialPermissions[0].role);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, string[]>>(
    Object.fromEntries(initialPermissions.map(p => [p.role, p.permissions]))
  );

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `SH-${Math.floor(Math.random() * 1000)}`;
    setRoster([...roster, { ...newShift, id }]);
    setIsShiftModalOpen(false);
  };

  const removeShift = (id: string) => {
    setRoster(roster.filter(s => s.id !== id));
  };

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Week Navigator State
  const [weekOffset, setWeekOffset] = useState(0);

  // Edit Staff State
  const [editStaff, setEditStaff] = useState<typeof clinicStaff[0] | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", department: "", phone: "", email: "", status: "" });

  // Assign Shift Modal State
  const [assignModal, setAssignModal] = useState<{ day: string; timeSlot: string } | null>(null);

  // Create Custom Role Modal State
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Permissions Saved State
  const [permissionsSaved, setPermissionsSaved] = useState(false);

  const togglePermission = (role: string, perm: string) => {
    setPermissionsMap(prev => {
      const current = prev[role] || [];
      const updated = current.includes(perm) 
        ? current.filter(p => p !== perm)
        : [...current, perm];
      return { ...prev, [role]: updated };
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staff Management"
        description="Oversee your clinical team, coordinate shift schedules, and manage role-based access control."
        actions={[
          { label: "Add Staff Member", onClick: () => openModal("staff"), variant: "primary" },
          { label: "Schedule Shift", onClick: () => setIsShiftModalOpen(true), variant: "outline" },
        ]}
      />

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {[
          { label: "Total Team", value: clinicStaff.length, sub: "Active members", icon: Users, color: "text-blue-600" },
          { label: "Productivity", value: "88%", sub: "+4% from last week", icon: TrendingUp, color: "text-emerald-600" },
          { label: "On Duty Now", value: 6, sub: "Across all branches", icon: Clock, color: "text-amber-600" },
          { label: "Open Shifts", value: 2, sub: "For upcoming week", icon: CalendarDays, color: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={cn("p-2 sm:p-3 rounded-xl bg-slate-50 shrink-0", stat.color)}>
                <stat.icon size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Tabs */}
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit min-w-max">
          {[
            { id: "team", label: "Team", fullLabel: "Team Directory", icon: Users },
            { id: "shifts", label: "Shifts", fullLabel: "Shift Schedule", icon: CalendarDays },
            { id: "permissions", label: "Roles", fullLabel: "Roles & Permissions", icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white text-brand-navy shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <tab.icon size={14} className="sm:w-4 sm:h-4" />
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.fullLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "team" && (
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-4 sm:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-bold">Staff Directory</CardTitle>
                <div className="flex gap-2 self-start">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" onClick={() => setShowFilters(!showFilters)}>
                      <span className="sm:hidden">Filter</span>
                      <span className="hidden sm:inline uppercase tracking-wider">Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" onClick={() => {
                      const csv = "Name,Role,Department,Status\n" + clinicStaff.map(s => `${s.name},${s.role},${s.department},${s.status}`).join("\n");
                      const blob = new Blob([csv], {type:"text/csv"});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "staff-directory.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      <span className="sm:hidden">Export</span>
                      <span className="hidden sm:inline uppercase tracking-wider">Export</span>
                    </Button>
                </div>
              </div>
              {showFilters && (
                <div className="flex flex-wrap gap-3 px-8 py-4 bg-slate-50 border-t border-slate-100">
                  <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                    <option value="">All Roles</option>
                    <option>Doctor</option><option>Nurse</option><option>Receptionist</option><option>Optometrist</option><option>Optician</option><option>Pharmacist</option><option>Cashier</option>
                  </select>
                  <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                    <option value="">All Departments</option>
                    <option>Clinic</option><option>Front desk</option><option>Pharmacy</option><option>Optical</option>
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                    <option value="">All Statuses</option>
                    <option>Active</option><option>Inactive</option>
                  </select>
                  <button onClick={() => { setFilterRole(""); setFilterDepartment(""); setFilterStatus(""); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider px-2">Reset</button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
               {/* Mobile: card list */}
               <div className="md:hidden divide-y divide-slate-100">
                 {clinicStaff.filter(s => !filterRole || s.role === filterRole).filter(s => !filterDepartment || s.department === filterDepartment).filter(s => !filterStatus || s.status === filterStatus).map((staff) => (
                   <div key={staff.id} className="p-4">
                     <div className="flex items-start justify-between gap-3">
                       <div className="flex items-center gap-3 min-w-0">
                         <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">
                           {staff.name.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div className="min-w-0">
                           <p className="font-bold text-slate-900 text-sm truncate">{staff.name}</p>
                           <p className="text-[10px] text-slate-500 truncate">{staff.role} • {staff.department}</p>
                         </div>
                       </div>
                       <div className="shrink-0 flex flex-col items-end gap-1">
                         <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black uppercase", staff.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{staff.status}</Badge>
                         <button onClick={() => { setEditStaff(staff); setEditForm({ name: staff.name, role: staff.role, department: staff.department, phone: "", email: staff.email, status: staff.status }); }} className="text-[10px] font-bold text-sky-600">Edit</button>
                       </div>
                     </div>
                   </div>
                 ))}
                 {clinicStaff.filter(s => !filterRole || s.role === filterRole).filter(s => !filterDepartment || s.department === filterDepartment).filter(s => !filterStatus || s.status === filterStatus).length === 0 && (
                   <p className="p-8 text-center text-sm text-slate-500">No staff members match filters.</p>
                 )}
               </div>
               {/* Desktop: full table */}
               <div className="hidden md:block overflow-x-auto"><Table>
                 <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-8 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                    <TableHead className="h-12 pr-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicStaff.filter(s => !filterRole || s.role === filterRole).filter(s => !filterDepartment || s.department === filterDepartment).filter(s => !filterStatus || s.status === filterStatus).map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-slate-50/50 border-slate-50">
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{staff.name}</p>
                            <p className="text-xs text-slate-500">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-slate-600 text-sm">{staff.role}</TableCell>
                      <TableCell className="py-4 text-slate-500 text-sm">{staff.department}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                                <div className="h-full bg-sky-500 w-[85%]" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-400">85%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", staff.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{staff.status}</Badge>
                      </TableCell>
                      <TableCell className="px-8 py-4 text-right">
                         <Button variant="ghost" size="sm" className="font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl" onClick={() => { setEditStaff(staff); setEditForm({ name: staff.name, role: staff.role, department: staff.department, phone: "", email: staff.email, status: staff.status }); }}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
               </Table></div>
             </CardContent>
          </Card>
        )}

        {activeTab === "shifts" && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <Card className="lg:col-span-5 border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-base sm:text-lg">Weekly Roster</CardTitle>
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                        {(() => {
                          const baseDate = new Date(2026, 4, 25);
                          baseDate.setDate(baseDate.getDate() + weekOffset * 7);
                          const end = new Date(baseDate);
                          end.setDate(end.getDate() + 6);
                          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                          return <span className="text-sm font-bold text-slate-900">{months[baseDate.getMonth()]} {baseDate.getDate()} – {months[end.getMonth()]} {end.getDate()}, {end.getFullYear()}</span>;
                        })()}
                        <div className="flex gap-1">
                             <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setWeekOffset(w => w - 1)}>{"<"}</Button>
                             <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setWeekOffset(w => w + 1)}>{">"}</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-4 mb-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{day}</p>
                                <div className="h-16 sm:h-24 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-white hover:shadow-md transition-all cursor-pointer group" onClick={() => setAssignModal({ day, timeSlot: "Morning" })}>
                                    <Plus size={14} className="text-slate-300 group-hover:text-sky-500 sm:w-4 sm:h-4" />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 group-hover:text-sky-600">Assign</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {roster.map(shift => (
                            <div key={shift.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-[10px] font-bold">{shift.staffName[0]}</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{shift.staffName}</p>
                                        <p className="text-[10px] font-medium text-slate-500">{shift.role} • {shift.day}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Badge className="bg-sky-50 text-sky-700 border-sky-100">{shift.shift}</Badge>
                                     <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeShift(shift.id)}
                                      className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-600"
                                     >
                                       <Trash2 size={12} className="mr-1" /> Remove
                                     </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-brand-navy text-white">
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Staff Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">On Call Support</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400"><Users size={20}/></div>
                            <div>
                                <p className="text-sm font-bold">Dr. E. Nwachukwu</p>
                                <p className="text-[10px] text-white/60">Primary Surgeon</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                         <p className="text-xs text-white/60 leading-relaxed mb-4 italic">"Please ensure all optical desk shifts are covered by at least two staff members during peak morning hours."</p>
                         <Button className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold" onClick={() => setIsShiftModalOpen(true)}>Generate Roster</Button>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Access Levels</p>
                {Object.keys(permissionsMap).map(role => (
                    <Card 
                        key={role} 
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                            "cursor-pointer transition-all border-none shadow-sm rounded-2xl",
                            selectedRole === role ? "bg-sky-50 ring-2 ring-sky-100" : "hover:bg-slate-50"
                        )}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                                  selectedRole === role ? "bg-sky-600" : "bg-slate-900"
                                )}>
                                  <ShieldCheck size={20}/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{role}</p>
                                    <p className="text-[10px] text-slate-500">{permissionsMap[role]?.length || 0} active permissions</p>
                                </div>
                            </div>
                            {selectedRole === role && <CheckCircle2 size={16} className="text-sky-600" />}
                        </CardContent>
                    </Card>
                ))}
                <Button variant="outline" className="w-full rounded-2xl border-dashed border-2 py-8 text-slate-400 font-bold hover:text-sky-600 hover:border-sky-200" onClick={() => { setNewRoleName(""); setNewRolePerms([]); setCreateRoleModal(true); }}>
                    <Plus size={20} className="mr-2" /> Create Custom Role
                </Button>
            </div>

            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
                    <div>
                        <CardTitle className="text-base sm:text-lg">{selectedRole} Permissions</CardTitle>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Configure individual access modules for this role.</p>
                    </div>
                    <Button className="self-start bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20" onClick={() => { setPermissionsSaved(true); setTimeout(() => setPermissionsSaved(false), 3000); }}>
                      {permissionsSaved ? "✓ Saved!" : "Save Configuration"}
                    </Button>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-8">
                        {[
                            { group: "Patient Management", perms: ["view_patients", "register_patient", "edit_medical_records", "delete_profile"] },
                            { group: "Financial Records", perms: ["view_revenue", "manage_invoices", "process_refunds", "hmo_claims"] },
                            { group: "Clinical Workflow", perms: ["create_consultation", "order_lab_tests", "prescribe_drugs", "surgery_booking"] }
                        ].map((group, idx) => (
                            <div key={idx} className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{group.group}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {group.perms.map((perm, pidx) => {
                                        const isActive = permissionsMap[selectedRole]?.includes(perm);
                                        return (
                                          <button 
                                            key={pidx} 
                                            onClick={() => togglePermission(selectedRole, perm)}
                                            className={cn(
                                              "flex items-center justify-between p-3 rounded-2xl border transition-all text-left group",
                                              isActive 
                                                ? "bg-sky-50 border-sky-100 ring-1 ring-sky-50" 
                                                : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200"
                                            )}
                                          >
                                              <span className={cn(
                                                "text-xs font-bold capitalize",
                                                isActive ? "text-sky-700" : "text-slate-600"
                                              )}>{perm.replace(/_/g, ' ')}</span>
                                              <div className={cn(
                                                "w-8 h-4 rounded-full relative transition-colors",
                                                isActive ? "bg-sky-500" : "bg-slate-200"
                                              )}>
                                                  <div className={cn(
                                                    "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform",
                                                    isActive ? "right-0.5" : "left-0.5"
                                                  )} />
                                              </div>
                                          </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* New Shift Modal */}
      <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Schedule New Shift">
          <form onSubmit={handleAddShift} className="space-y-6 py-4">
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Staff Member</label>
                      <Tooltip content="Select the team member for this assignment">
                        <select 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            value={newShift.staffName}
                            onChange={(e) => {
                            const staff = clinicStaff.find(s => s.name === e.target.value);
                            setNewShift({...newShift, staffName: e.target.value, role: staff?.role || ""});
                            }}
                        >
                            {clinicStaff.map(s => <option key={s.id}>{s.name}</option>)}
                        </select>
                      </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Day</label>
                          <Tooltip content="Choose the calendar day for the shift">
                            <select 
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                                value={newShift.day}
                                onChange={(e) => setNewShift({...newShift, day: e.target.value})}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                            </select>
                          </Tooltip>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Shift Time</label>
                          <Tooltip content="Morning, Afternoon, or Night rotation">
                            <select 
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                                value={newShift.shift}
                                onChange={(e) => setNewShift({...newShift, shift: e.target.value as any})}
                            >
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Night</option>
                            </select>
                          </Tooltip>
                      </div>
                  </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setIsShiftModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-sky-600/20">Assign Shift</Button>
              </div>
          </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={!!editStaff} onClose={() => setEditStaff(null)} title="Edit Staff Member">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Name</label>
            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Role</label>
              <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                <option>Doctor</option><option>Nurse</option><option>Receptionist</option><option>Optometrist</option><option>Optician</option><option>Pharmacist</option><option>Cashier</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Department</label>
              <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
                <option>Clinic</option><option>Front desk</option><option>Pharmacy</option><option>Optical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phone</label>
            <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
            <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as "Active" | "Inactive"})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
            <button onClick={() => setEditStaff(null)} className="rounded-full border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={() => {
              setEditStaff(null);
            }} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Save</button>
          </div>
        </div>
      </Modal>

      {/* Assign Shift Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Staff – ${assignModal?.day ?? ""}`}>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Staff Member</label>
            <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
              {clinicStaff.map(s => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Shift Time</label>
            <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none">
              <option>Morning</option><option>Afternoon</option><option>Night</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
            <button onClick={() => setAssignModal(null)} className="rounded-full border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={() => setAssignModal(null)} className="rounded-full bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700">Assign</button>
          </div>
        </div>
      </Modal>

      {/* Create Custom Role Modal */}
      <Modal isOpen={createRoleModal} onClose={() => setCreateRoleModal(false)} title="Create Custom Role">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Role Name</label>
            <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none" placeholder="e.g. Lab Technician" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Permissions</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {["view_patients","edit_patients","register_patient","manage_billing","view_revenue","manage_invoices","create_consultation","order_lab_tests","prescribe_drugs","surgery_booking"].map(perm => (
                <label key={perm} className="flex items-center gap-2 text-xs font-bold text-slate-600 capitalize cursor-pointer">
                  <input type="checkbox" checked={newRolePerms.includes(perm)} onChange={e => {
                    setNewRolePerms(prev => e.target.checked ? [...prev, perm] : prev.filter(p => p !== perm));
                  }} className="rounded" />
                  {perm.replace(/_/g, " ")}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
            <button onClick={() => setCreateRoleModal(false)} className="rounded-full border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={() => {
              if (newRoleName.trim()) {
                setPermissionsMap(prev => ({ ...prev, [newRoleName.trim()]: newRolePerms }));
                setSelectedRole(newRoleName.trim());
                setCreateRoleModal(false);
              }
            }} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
