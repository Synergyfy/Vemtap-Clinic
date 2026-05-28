"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  clinicAppointmentsToday,
  clinicConsultations,
  clinicEyeTests,
  clinicFollowUps,
  clinicHmoClaims,
  clinicInvoicesToday,
  clinicOpticalOrders,
  clinicPatientDocuments,
  clinicPatientNotes,
  clinicPatients,
  clinicPrescriptions,
  formatNGN,
} from "@/app/clinic/_mock/clinic-data";

type PatientTab =
  | "Overview"
  | "Consultations"
  | "Eye tests"
  | "Prescriptions"
  | "Lens orders"
  | "Billing"
  | "HMO"
  | "Follow-ups"
  | "Documents";

function tabButtonClass(active: boolean) {
  return [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "bg-sky-600 text-white" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ].join(" ");
}

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  if (status === "New") return <Badge className="bg-sky-600 text-white">New</Badge>;
  if (status === "Inactive") return <Badge variant="secondary">Inactive</Badge>;

  if (status === "Open") return <Badge className="bg-amber-600 text-white">Open</Badge>;
  if (status === "Closed") return <Badge className="bg-slate-200 text-slate-700">Closed</Badge>;
  if (status === "Pending") return <Badge variant="outline">Pending</Badge>;
  if (status === "Scheduled") return <Badge variant="outline">Scheduled</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;

  if (status === "Draft") return <Badge variant="outline">Draft</Badge>;
  if (status === "In production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (status === "Dispensed") return <Badge className="bg-slate-200 text-slate-700">Dispensed</Badge>;

  if (status === "Paid") return <Badge className="bg-emerald-600 text-white">Paid</Badge>;
  if (status === "Queried") return <Badge className="bg-rose-600 text-white">Queried</Badge>;
  if (status === "Approved") return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
  if (status === "Submitted") return <Badge variant="outline">Submitted</Badge>;

  return <Badge variant="outline">{status}</Badge>;
}

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;
  const patient = clinicPatients.find((p) => p.id === patientId);
  if (!patient) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Patient not found"
          description="This patient record does not exist in the current dataset."
          actions={[{ label: "Back to patients", href: "/clinic/patients", variant: "primary" }]}
        />
      </div>
    );
  }

  const [tab, setTab] = React.useState<PatientTab>("Overview");

  const appointments = clinicAppointmentsToday.filter((a) => a.patientId === patientId);
  const consultations = clinicConsultations.filter((c) => c.patientId === patientId);
  const tests = clinicEyeTests.filter((t) => t.patientId === patientId);
  const prescriptions = clinicPrescriptions.filter((r) => r.patientId === patientId);
  const lensOrders = clinicOpticalOrders.filter((o) => o.patientId === patientId);
  const billing = clinicInvoicesToday.filter((i) => i.patientName === patient.name);
  const hmoClaims = clinicHmoClaims.filter((c) => c.patientName === patient.name);
  const followUps = clinicFollowUps.filter((f) => f.patientId === patientId);
  const documents = clinicPatientDocuments.filter((d) => d.patientId === patientId);
  const notes = clinicPatientNotes.filter((n) => n.patientId === patientId);

  const paidTotal = billing.filter((b) => b.status === "Paid").reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={patient.name}
        description={`${patient.id} • ${patient.sex}, ${patient.age} • ${patient.phone}`}
        actions={[
          { label: "Back to patients", href: "/clinic/patients" },
          { label: "Create appointment", href: "/clinic/appointments" },
          { label: "Add lens order", href: "/clinic/optical" },
          { label: "Create invoice", href: "/clinic/finance" },
          { label: "Verify HMO", href: "/clinic/hmo" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            "Overview",
            "Consultations",
            "Eye tests",
            "Prescriptions",
            "Lens orders",
            "Billing",
            "HMO",
            "Follow-ups",
            "Documents",
          ] as PatientTab[]
        ).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tabButtonClass(tab === t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Patient overview</CardTitle>
              <div>{statusBadge(patient.status)}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Appointments (today)</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{appointments.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Lens orders</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{lensOrders.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Paid total (today)</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(paidTotal)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Patient timeline</p>
                <p className="mt-1 text-sm text-slate-500">
                  Latest activity from appointments, consultations, tests, prescriptions, and optical.
                </p>
                <div className="mt-4 space-y-3">
                  {appointments.slice(0, 2).map((a) => (
                    <div key={a.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{a.service}</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {a.startTime} • {a.provider} • {a.status}
                      </p>
                    </div>
                  ))}
                  {consultations.slice(0, 2).map((c) => (
                    <div key={c.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">Consultation</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {c.visitISO} • {c.provider} • {c.diagnosis}
                      </p>
                    </div>
                  ))}
                  {lensOrders.slice(0, 2).map((o) => (
                    <div key={o.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">Optical order</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {o.lens} • Due {o.dueISO} • {o.status}
                      </p>
                    </div>
                  ))}
                  {!appointments.length && !consultations.length && !lensOrders.length ? (
                    <p className="text-sm text-slate-500">No activity yet for this patient.</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Notes</CardTitle>
              <Link href="/clinic/support" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                Open support
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length ? (
                notes.slice(0, 6).map((n) => (
                  <div key={n.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{n.tag}</p>
                        <p className="mt-1 text-sm text-slate-500">{n.note}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {n.createdISO} • {n.author}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No notes yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "Consultations" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Consultations</CardTitle>
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open queue
            </Link>
          </CardHeader>
          <CardContent>
            {consultations.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Chief complaint</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="tabular-nums">{c.visitISO}</TableCell>
                      <TableCell>{c.provider}</TableCell>
                      <TableCell>{c.chiefComplaint}</TableCell>
                      <TableCell>{c.diagnosis}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No consultations recorded yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Eye tests" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Eye tests</CardTitle>
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Add from workflow
            </Link>
          </CardHeader>
          <CardContent>
            {tests.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Performed by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="tabular-nums">{t.testISO}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.summary}</TableCell>
                      <TableCell>{t.performedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No tests recorded yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Prescriptions" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prescriptions</CardTitle>
            <Link href="/clinic/pharmacy" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open pharmacy
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.length ? (
              prescriptions.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">Prescription • {r.prescribedISO}</p>
                      <p className="mt-1 text-sm text-slate-500">{r.provider}</p>
                    </div>
                    <div className="shrink-0">{statusBadge(r.status)}</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {r.items.map((it) => (
                      <div key={it.name} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-900">{it.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {it.dose} • {it.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No prescriptions recorded yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Lens orders" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Lens orders</CardTitle>
            <Link href="/clinic/optical" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open optical
            </Link>
          </CardHeader>
          <CardContent>
            {lensOrders.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Lens</TableHead>
                    <TableHead>Frame</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lensOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.lens}</TableCell>
                      <TableCell>{o.frame}</TableCell>
                      <TableCell className="tabular-nums">{o.dueISO}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No lens orders for this patient yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Billing" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Billing</CardTitle>
              <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                Open finance
              </Link>
            </CardHeader>
            <CardContent>
              {billing.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billing.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.id}</TableCell>
                        <TableCell>{b.payerType}</TableCell>
                        <TableCell>{b.method}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(b.amount)}</TableCell>
                        <TableCell>{statusBadge(b.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-slate-500">No invoices recorded for this patient today.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Paid total</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(paidTotal)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Pending invoices</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                  {billing.filter((b) => b.status === "Pending").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "HMO" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>HMO</CardTitle>
            <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open HMO
            </Link>
          </CardHeader>
          <CardContent>
            {hmoClaims.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim</TableHead>
                    <TableHead>HMO</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hmoClaims.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.id}</TableCell>
                      <TableCell>{c.hmo}</TableCell>
                      <TableCell className="tabular-nums">{formatNGN(c.amount)}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No HMO claims recorded for this patient yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Follow-ups" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Follow-ups</CardTitle>
            <Link href="/clinic/appointments" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Schedule follow-up
            </Link>
          </CardHeader>
          <CardContent>
            {followUps.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="tabular-nums">{f.dueISO}</TableCell>
                      <TableCell>{f.reason}</TableCell>
                      <TableCell>{statusBadge(f.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No follow-ups created yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "Documents" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Documents &amp; scans</CardTitle>
            <Link href="/clinic/settings" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Document settings
            </Link>
          </CardHeader>
          <CardContent>
            {documents.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell className="tabular-nums">{d.uploadedISO}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
