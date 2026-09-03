"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useRecords, usePatientPrescriptions } from "@/hooks/useRecords";
import { useLensOrders } from "@/hooks/useOptician";
import { useInvoices } from "@/hooks/useBilling";
import { useHmoClaims } from "@/hooks/useHmo";
import { useUploads } from "@/hooks/useFileUpload";
import { PageSkeleton } from "@/components/ui/skeleton";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

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
  if (status === "Paid") return <Badge className="bg-emerald-600 text-white">Paid</Badge>;
  if (status === "Pending") return <Badge variant="outline">Pending</Badge>;
  if (status === "Submitted") return <Badge variant="outline">Submitted</Badge>;
  if (status === "Approved") return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const { data: patientsResponse, isLoading: loadingPatient } = usePatients();
  const patients = patientsResponse?.data ?? [];
  const patient = patients.find((p: any) => p.id === patientId);

  const { data: appointmentsResponse = [] } = useAppointments();
  const appointments = appointmentsResponse.data ?? [];
  const { data: records = [] } = useRecords({ patientId });
  const { data: prescriptions = [] } = usePatientPrescriptions(patientId);
  const { data: lensOrders = [] } = useLensOrders();
  const invoices = useInvoices();
  const { data: hmoClaims = [] } = useHmoClaims();
  const { data: uploads = [] } = useUploads({ entityType: "patient", entityId: patientId });

  const [tab, setTab] = React.useState<PatientTab>("Overview");

  if (loadingPatient) return <PageSkeleton />;

  if (!patient) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Patient not found"
          description="This patient record does not exist."
          actions={[{ label: "Back to patients", href: "/clinic/patients", variant: "default" }]}
        />
      </div>
    );
  }

  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAppointments = appointments.filter((a: any) => a.patientId === patientId);
  const patientInvoices = invoices.filter((i: any) => i.patientId === patientId);
  const patientHmoClaims = hmoClaims.filter((c: any) => c.patientId === patientId);
  const patientLensOrders = lensOrders.filter((o: any) => o.patientId === patientId);
  const paidTotal = patientInvoices.filter((i: any) => i.status === "Paid").reduce((acc: number, i: any) => acc + Number(i.totalAmount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={patientName}
        description={`${patient.id.slice(0, 8)} • ${patient.gender || "-"} • ${patient.phone || "-"}`}
        actions={[
          { label: "Back to patients", href: "/clinic/patients" },
          { label: "Create appointment", href: "/clinic/appointments" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {(["Overview", "Consultations", "Prescriptions", "Lens orders", "Billing", "HMO", "Documents"] as PatientTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tabButtonClass(tab === t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Patient overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Appointments</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{patientAppointments.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Medical records</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{records.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Lens orders</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{patientLensOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Quick info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{patient.email || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{patient.phone || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total paid</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(paidTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "Consultations" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Medical records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Treatment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="tabular-nums">{r.visitDate?.slice(0, 10)}</TableCell>
                        <TableCell>{r.recordType}</TableCell>
                        <TableCell>{r.diagnosis || "-"}</TableCell>
                        <TableCell>{r.treatment || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No records yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "Prescriptions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.length ? (
              prescriptions.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">Prescription</p>
                      <p className="mt-1 text-sm text-slate-500">{r.medication} • {r.dosage}</p>
                    </div>
                    <div className="shrink-0">{statusBadge(r.isActive ? "Active" : "Completed")}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No prescriptions yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "Lens orders" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Lens orders</CardTitle>
          </CardHeader>
          <CardContent>
            {patientLensOrders.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientLensOrders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.id.slice(0, 8)}</TableCell>
                        <TableCell>{o.lensType || "-"}</TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No lens orders yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "Billing" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Billing</CardTitle>
          </CardHeader>
          <CardContent>
            {patientInvoices.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientInvoices.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(Number(inv.totalAmount))}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(Number(inv.amountPaid))}</TableCell>
                        <TableCell>{statusBadge(inv.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No invoices yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "HMO" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">HMO claims</CardTitle>
          </CardHeader>
          <CardContent>
            {patientHmoClaims.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientHmoClaims.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.claimNumber}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(Number(c.amountClaimed))}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No HMO claims yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "Documents" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {uploads.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.fileName}</TableCell>
                        <TableCell>{d.fileType}</TableCell>
                        <TableCell className="tabular-nums">{d.createdAt?.slice(0, 10)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
