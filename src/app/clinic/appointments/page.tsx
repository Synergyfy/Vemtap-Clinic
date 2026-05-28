"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import {
  clinicAppointmentsMissed,
  clinicAppointmentsToday,
  clinicAppointmentsUpcoming,
  type ClinicAppointment,
} from "@/app/clinic/_mock/clinic-data";

type AppointmentsTab = "Calendar" | "Upcoming" | "Follow-ups" | "Walk-ins" | "Missed";

function statusBadge(status: string) {
  if (status === "Checked-in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (status === "In-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Cancelled") return <Badge className="bg-slate-200 text-slate-700">Cancelled</Badge>;
  if (status === "Missed") return <Badge className="bg-rose-600 text-white">Missed</Badge>;
  return <Badge variant="outline">Scheduled</Badge>;
}

function kindBadge(kind?: ClinicAppointment["kind"]) {
  if (kind === "Walk-in") return <Badge className="bg-purple-600 text-white">Walk-in</Badge>;
  if (kind === "Follow-up") return <Badge className="bg-emerald-600 text-white">Follow-up</Badge>;
  if (kind === "Regular") return <Badge variant="outline">Regular</Badge>;
  return <Badge variant="outline">Regular</Badge>;
}

function tabButtonClass(active: boolean) {
  return [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "bg-sky-600 text-white" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ].join(" ");
}

function toISODate(date: Date) {
  return new Intl.DateTimeFormat("en-CA").format(date);
}

function weekdayShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
}

function monthYearLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

function weekdayHeader() {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
}

function addDays(iso: string, days: number) {
  const base = new Date(iso + "T00:00:00");
  base.setDate(base.getDate() + days);
  return toISODate(base);
}

function startOfMonthISO(iso: string) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(1);
  return toISODate(d);
}

function addMonthsISO(iso: string, months: number) {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  d.setDate(1);
  return toISODate(d);
}

function daysInMonth(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

function mondayStartIndex(iso: string) {
  // Monday=0 ... Sunday=6
  const d = new Date(iso + "T00:00:00");
  const js = d.getDay(); // Sun=0 ... Sat=6
  return (js + 6) % 7;
}

function formatDayNumber(iso: string) {
  return String(new Date(iso + "T00:00:00").getDate());
}

export default function AppointmentsPage() {
  const todayISO = React.useMemo(() => toISODate(new Date()), []);
  const [tab, setTab] = React.useState<AppointmentsTab>("Calendar");

  const [todayAppointments, setTodayAppointments] = React.useState<ClinicAppointment[]>(clinicAppointmentsToday);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<ClinicAppointment[]>(clinicAppointmentsUpcoming);
  const [missedAppointments, setMissedAppointments] = React.useState<ClinicAppointment[]>(clinicAppointmentsMissed);

  const [isNewOpen, setIsNewOpen] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = React.useState<string | null>(null);
  const [calendarMonthISO, setCalendarMonthISO] = React.useState(() => startOfMonthISO(todayISO));
  const [selectedDayISO, setSelectedDayISO] = React.useState<string>(todayISO);
  const [form, setForm] = React.useState({
    patientName: "",
    dateISO: todayISO,
    startTime: "09:00",
    service: "Consultation" as ClinicAppointment["service"],
    provider: "Dr. A. Bello",
    kind: "Regular" as NonNullable<ClinicAppointment["kind"]>,
    reason: "",
  });

  const scheduled = todayAppointments.filter((a) => a.status === "Scheduled").length;
  const checkedIn = todayAppointments.filter((a) => a.status === "Checked-in").length;
  const inProgress = todayAppointments.filter((a) => a.status === "In-progress").length;

  const followUpsCount =
    todayAppointments.filter((a) => a.kind === "Follow-up").length +
    upcomingAppointments.filter((a) => a.kind === "Follow-up").length;
  const walkInsCount =
    todayAppointments.filter((a) => a.kind === "Walk-in").length + upcomingAppointments.filter((a) => a.kind === "Walk-in").length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim()) return;
    const nextId = `A-${1000 + todayAppointments.length + upcomingAppointments.length + missedAppointments.length + 1}`;
    const newAppointment: ClinicAppointment = {
      id: nextId,
      patientId: "P-NEW",
      patientName: form.patientName.trim(),
      dateISO: form.dateISO,
      startTime: form.startTime,
      endTime: "",
      service: form.service,
      provider: form.provider,
      kind: form.kind,
      reason: form.reason.trim() ? form.reason.trim() : undefined,
      createdISO: new Date().toISOString(),
      status: "Scheduled",
    };

    if (form.dateISO === todayISO) setTodayAppointments((prev) => [newAppointment, ...prev]);
    else setUpcomingAppointments((prev) => [newAppointment, ...prev]);

    setIsNewOpen(false);
    setForm({
      patientName: "",
      dateISO: todayISO,
      startTime: "09:00",
      service: "Consultation",
      provider: "Dr. A. Bello",
      kind: "Regular",
      reason: "",
    });
  };

  const openReschedule = (id: string) => {
    setRescheduleTargetId(id);
    setIsRescheduleOpen(true);
  };

  const reschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTargetId) return;
    if (!form.patientName.trim()) return;

    const moveAppointment = (items: ClinicAppointment[]) => {
      const idx = items.findIndex((a) => a.id === rescheduleTargetId);
      if (idx === -1) return { nextItems: items, moved: null as ClinicAppointment | null };
      const target = items[idx];
      const nextItems = [...items.slice(0, idx), ...items.slice(idx + 1)];
      return { nextItems, moved: target };
    };

    const fromToday = moveAppointment(todayAppointments);
    const fromUpcoming = fromToday.moved ? { nextItems: upcomingAppointments, moved: fromToday.moved } : moveAppointment(upcomingAppointments);
    const fromMissed = fromUpcoming.moved ? { nextItems: missedAppointments, moved: fromUpcoming.moved } : moveAppointment(missedAppointments);

    setTodayAppointments(fromToday.nextItems);
    setUpcomingAppointments(fromUpcoming.nextItems);
    setMissedAppointments(fromMissed.nextItems);

    const original = fromMissed.moved;
    if (!original) return;

    const nextId = `A-${1000 + todayAppointments.length + upcomingAppointments.length + missedAppointments.length + 1}`;
    const rescheduled: ClinicAppointment = {
      ...original,
      id: nextId,
      patientName: form.patientName.trim(),
      dateISO: form.dateISO,
      startTime: form.startTime,
      service: form.service,
      provider: form.provider,
      kind: form.kind,
      reason: form.reason.trim() ? form.reason.trim() : original.reason,
      status: "Scheduled",
      createdISO: new Date().toISOString(),
      rescheduledFromId: original.id,
    };

    if (rescheduled.dateISO === todayISO) setTodayAppointments((prev) => [rescheduled, ...prev]);
    else setUpcomingAppointments((prev) => [rescheduled, ...prev]);

    setIsRescheduleOpen(false);
    setRescheduleTargetId(null);
  };

  const allAppointments = React.useMemo(
    () => [...todayAppointments, ...upcomingAppointments, ...missedAppointments],
    [missedAppointments, todayAppointments, upcomingAppointments]
  );

  const appointmentsByISODate = React.useMemo(() => {
    const map = new Map<string, ClinicAppointment[]>();
    for (const a of allAppointments) {
      const iso = a.dateISO ?? todayISO;
      map.set(iso, [...(map.get(iso) ?? []), a]);
    }
    for (const [iso, list] of map.entries()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(iso, list);
    }
    return map;
  }, [allAppointments, todayISO]);

  const monthGrid = React.useMemo(() => {
    const monthStart = calendarMonthISO;
    const first = startOfMonthISO(monthStart);
    const offset = mondayStartIndex(first);
    const totalDays = daysInMonth(first);
    const cells: Array<{ iso: string | null; inMonth: boolean }> = [];

    for (let i = 0; i < offset; i++) cells.push({ iso: null, inMonth: false });
    for (let d = 1; d <= totalDays; d++) {
      const iso = toISODate(new Date(first + "T00:00:00"));
      const dayISO = addDays(first, d - 1);
      cells.push({ iso: dayISO, inMonth: true });
    }

    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push({ iso: null, inMonth: false });
    return cells;
  }, [calendarMonthISO]);

  const selectedAppointments = React.useMemo(() => {
    const list = appointmentsByISODate.get(selectedDayISO) ?? [];
    return list;
  }, [appointmentsByISODate, selectedDayISO]);

  const statusAccent = (status: ClinicAppointment["status"]) => {
    if (status === "Checked-in") return "border-l-sky-500";
    if (status === "In-progress") return "border-l-amber-500";
    if (status === "Completed") return "border-l-emerald-500";
    if (status === "Cancelled") return "border-l-slate-300";
    if (status === "Missed") return "border-l-rose-500";
    return "border-l-slate-300";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointments"
        description="Appointment calendar, upcoming visits, follow-ups, walk-ins, missed appointments, and rescheduling."
        actions={[
          { label: "New appointment", onClick: () => setIsNewOpen(true), variant: "primary" },
          { label: "Queue management", href: "/clinic/queue" },
          { label: "Patients", href: "/clinic/patients" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {( ["Calendar", "Upcoming", "Follow-ups", "Walk-ins", "Missed"] as AppointmentsTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tabButtonClass(tab === t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Today</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{todayAppointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Checked-in</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{checkedIn}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Missed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{missedAppointments.length}</p>
          </CardContent>
        </Card>
      </div>

      {tab === "Calendar" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Appointment calendar</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{monthYearLabel(calendarMonthISO)}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>{followUpsCount} follow-up(s)</span>
              <span>{walkInsCount} walk-in(s)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCalendarMonthISO((m) => addMonthsISO(m, -1))}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonthISO(startOfMonthISO(todayISO))}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonthISO((m) => addMonthsISO(m, 1))}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                      <span>Has appointments</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekdayHeader().map((w) => (
                    <div key={w} className="px-2 pb-1 text-xs font-semibold text-slate-500">
                      {w}
                    </div>
                  ))}

                  {monthGrid.map((cell, idx) => {
                    if (!cell.iso) return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-50" />;

                    const iso = cell.iso;
                    const isToday = iso === todayISO;
                    const isSelected = iso === selectedDayISO;
                    const count = (appointmentsByISODate.get(iso) ?? []).length;
                    const showDots = Math.min(3, count);
                    const showOverflow = count > 3 ? count - 3 : 0;

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDayISO(iso)}
                        className={[
                          "h-20 rounded-2xl border p-2 text-left transition",
                          "hover:border-slate-300 hover:bg-slate-50",
                          isSelected ? "border-sky-200 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200 bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={[
                              "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold tabular-nums",
                              isToday ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-900",
                            ].join(" ")}
                            title={iso}
                          >
                            {formatDayNumber(iso)}
                          </div>
                          {count ? <Badge className="bg-sky-600 text-white">{count}</Badge> : <span className="h-6" />}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: showDots }).map((_, i) => (
                              <span key={i} className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                            ))}
                            {showOverflow ? <span className="text-xs font-semibold text-sky-700">+{showOverflow}</span> : null}
                          </div>
                          <span className="text-xs text-slate-400">{weekdayShort(iso)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Click a day to view its agenda. Click an appointment in the agenda to reschedule.
                </p>
              </div>

              <div className="w-full lg:w-[420px]">
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-500">Agenda</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{selectedDayISO}</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedAppointments.length} appointment(s)</p>
                  </div>

                  <div className="max-h-[520px] space-y-3 overflow-auto p-4">
                    {selectedAppointments.length ? (
                      selectedAppointments.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setForm({
                              patientName: a.patientName,
                              dateISO: a.dateISO ?? todayISO,
                              startTime: a.startTime,
                              service: a.service,
                              provider: a.provider,
                              kind: (a.kind ?? "Regular") as NonNullable<ClinicAppointment["kind"]>,
                              reason: a.reason ?? "",
                            });
                            openReschedule(a.id);
                          }}
                          className={[
                            "w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition",
                            "hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-100",
                            "border-l-4",
                            statusAccent(a.status),
                          ].join(" ")}
                          title="Click to reschedule"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 tabular-nums">{a.startTime}</p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-900">{a.patientName}</p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {a.service} • {a.provider}
                              </p>
                            </div>
                            <div className="shrink-0 space-y-2 text-right">
                              <div>{statusBadge(a.status)}</div>
                              <div className="flex justify-end">{kindBadge(a.kind)}</div>
                            </div>
                          </div>
                          {a.reason ? (
                            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                              <span className="font-medium text-slate-600">Reason:</span> {a.reason}
                            </p>
                          ) : null}
                          {a.rescheduledFromId ? (
                            <p className="mt-2 text-[11px] text-slate-400">
                              Rescheduled from <span className="font-medium">{a.rescheduledFromId}</span>
                            </p>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">No appointments</p>
                        <p className="mt-1 text-xs text-slate-500">Use “New appointment” to add one.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Upcoming" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming appointments</CardTitle>
            <p className="text-sm text-slate-500">{upcomingAppointments.length} scheduled</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="tabular-nums">{a.dateISO}</TableCell>
                    <TableCell className="font-medium tabular-nums">{a.startTime}</TableCell>
                    <TableCell>
                      <Link href="/clinic/patients" className="text-sky-700 hover:text-sky-800">
                        {a.patientName}
                      </Link>
                    </TableCell>
                    <TableCell>{kindBadge(a.kind)}</TableCell>
                    <TableCell>{a.service}</TableCell>
                    <TableCell>{a.provider}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            patientName: a.patientName,
                            dateISO: a.dateISO ?? todayISO,
                            startTime: a.startTime,
                            service: a.service,
                            provider: a.provider,
                            kind: (a.kind ?? "Regular") as NonNullable<ClinicAppointment["kind"]>,
                            reason: a.reason ?? "",
                          });
                          openReschedule(a.id);
                        }}
                        className="text-sm font-medium text-sky-700 hover:text-sky-800"
                      >
                        Reschedule
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Follow-ups" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Follow-ups</CardTitle>
            <p className="text-sm text-slate-500">{followUpsCount} total</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...todayAppointments, ...upcomingAppointments]
                  .filter((a) => a.kind === "Follow-up")
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="tabular-nums">{a.dateISO ?? todayISO}</TableCell>
                      <TableCell className="font-medium tabular-nums">{a.startTime}</TableCell>
                      <TableCell>{a.patientName}</TableCell>
                      <TableCell>{a.reason ?? "—"}</TableCell>
                      <TableCell>{a.service}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              patientName: a.patientName,
                              dateISO: a.dateISO ?? todayISO,
                              startTime: a.startTime,
                              service: a.service,
                              provider: a.provider,
                              kind: (a.kind ?? "Follow-up") as NonNullable<ClinicAppointment["kind"]>,
                              reason: a.reason ?? "",
                            });
                            openReschedule(a.id);
                          }}
                          className="text-sm font-medium text-sky-700 hover:text-sky-800"
                        >
                          Reschedule
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Walk-ins" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Walk-ins</CardTitle>
            <p className="text-sm text-slate-500">{walkInsCount} total</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...todayAppointments, ...upcomingAppointments]
                  .filter((a) => a.kind === "Walk-in")
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="tabular-nums">{a.dateISO ?? todayISO}</TableCell>
                      <TableCell className="font-medium tabular-nums">{a.startTime}</TableCell>
                      <TableCell>{a.patientName}</TableCell>
                      <TableCell>{a.reason ?? "—"}</TableCell>
                      <TableCell>{a.service}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              patientName: a.patientName,
                              dateISO: a.dateISO ?? todayISO,
                              startTime: a.startTime,
                              service: a.service,
                              provider: a.provider,
                              kind: (a.kind ?? "Walk-in") as NonNullable<ClinicAppointment["kind"]>,
                              reason: a.reason ?? "",
                            });
                            openReschedule(a.id);
                          }}
                          className="text-sm font-medium text-sky-700 hover:text-sky-800"
                        >
                          Reschedule
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Missed" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Missed appointments</CardTitle>
            <p className="text-sm text-slate-500">{missedAppointments.length} missed</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missedAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="tabular-nums">{a.dateISO}</TableCell>
                    <TableCell className="font-medium tabular-nums">{a.startTime}</TableCell>
                    <TableCell>{a.patientName}</TableCell>
                    <TableCell>{kindBadge(a.kind)}</TableCell>
                    <TableCell>{a.service}</TableCell>
                    <TableCell>{a.provider}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            patientName: a.patientName,
                            dateISO: todayISO,
                            startTime: a.startTime,
                            service: a.service,
                            provider: a.provider,
                            kind: (a.kind ?? "Regular") as NonNullable<ClinicAppointment["kind"]>,
                            reason: a.reason ?? "",
                          });
                          openReschedule(a.id);
                        }}
                        className="text-sm font-medium text-sky-700 hover:text-sky-800"
                      >
                        Reschedule
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="New appointment">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Patient name</label>
            <input
              value={form.patientName}
              onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Fatima Yusuf"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input
                value={form.dateISO}
                onChange={(e) => setForm((p) => ({ ...p, dateISO: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="YYYY-MM-DD"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Use ISO format (YYYY-MM-DD).</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value as NonNullable<ClinicAppointment["kind"]> }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Regular">Regular</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Time</label>
              <input
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="09:00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm((p) => ({ ...p, service: e.target.value as ClinicAppointment["service"] }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Consultation">Consultation</option>
                <option value="Refraction">Refraction</option>
                <option value="Optical">Optical</option>
                <option value="Surgery Review">Surgery Review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Provider</label>
            <input
              value={form.provider}
              onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Dr. A. Bello"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
            <input
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Review, Frame fitting, Itchy eyes"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Create appointment
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule appointment">
        <form onSubmit={reschedule} className="space-y-4">
          <p className="text-sm text-slate-500">
            Rescheduling creates a new scheduled appointment and links it to the previous one.
          </p>

          <div>
            <label className="text-sm font-medium text-slate-700">Patient name</label>
            <input
              value={form.patientName}
              onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">New date</label>
              <input
                value={form.dateISO}
                onChange={(e) => setForm((p) => ({ ...p, dateISO: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="YYYY-MM-DD"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">New time</label>
              <input
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="09:00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm((p) => ({ ...p, service: e.target.value as ClinicAppointment["service"] }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Consultation">Consultation</option>
                <option value="Refraction">Refraction</option>
                <option value="Optical">Optical</option>
                <option value="Surgery Review">Surgery Review</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value as NonNullable<ClinicAppointment["kind"]> }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Regular">Regular</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Provider</label>
            <input
              value={form.provider}
              onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
            <input
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Patient requested a later time"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Confirm reschedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
