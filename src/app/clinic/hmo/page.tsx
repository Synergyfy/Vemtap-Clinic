"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  defaultClinicHmoAgreements,
  formatNGN,
  hmoMasterRecords,
  type ClinicHmoAgreement,
  type HmoMasterRecord,
} from "@/app/clinic/_mock/clinic-data";

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  if (status === "Paused") return <Badge className="bg-amber-600 text-white">Paused</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function methodBadge(method: HmoMasterRecord["claimsSubmissionMethod"]) {
  if (method === "API") return <Badge className="bg-purple-600 text-white">API</Badge>;
  if (method === "Email") return <Badge className="bg-slate-700 text-white">Email</Badge>;
  return <Badge className="bg-sky-600 text-white">Portal</Badge>;
}

function inputClassName() {
  return "mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100";
}

function numberField(value: number, onChange: (v: number) => void) {
  return (
    <input
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value || 0))}
      inputMode="numeric"
      className={inputClassName()}
    />
  );
}

export default function HMOPage() {
  const [agreements, setAgreements] = React.useState<ClinicHmoAgreement[]>(defaultClinicHmoAgreements);
  const [selectedHmoId, setSelectedHmoId] = React.useState<string>(defaultClinicHmoAgreements[0]?.hmoId ?? "");
  const [isActivateOpen, setIsActivateOpen] = React.useState(false);

  const selected = agreements.find((a) => a.hmoId === selectedHmoId) ?? null;
  const activatedIds = React.useMemo(() => new Set(agreements.map((a) => a.hmoId)), [agreements]);
  const availableToActivate = React.useMemo(
    () => hmoMasterRecords.filter((h) => !activatedIds.has(h.id) && h.status === "Active"),
    [activatedIds]
  );

  const [activateForm, setActivateForm] = React.useState({
    hmoId: availableToActivate[0]?.id ?? "",
    agreementStartISO: new Date().toISOString().slice(0, 10),
    billingCycle: "Monthly" as ClinicHmoAgreement["billingCycle"],
    paymentCycle: "Monthly" as ClinicHmoAgreement["paymentCycle"],
    claimsSubmissionSchedule: "Monthly" as ClinicHmoAgreement["claimsSubmissionSchedule"],
  });

  React.useEffect(() => {
    const next = availableToActivate[0]?.id ?? "";
    setActivateForm((p) => {
      if (p.hmoId) return p;
      if (!next) return p;
      return { ...p, hmoId: next };
    });
  }, [availableToActivate]);

  const activate = (e: React.FormEvent) => {
    e.preventDefault();
    const record = hmoMasterRecords.find((h) => h.id === activateForm.hmoId);
    if (!record) return;

    const newAgreement: ClinicHmoAgreement = {
      hmoId: record.id,
      hmoName: record.name,
      status: "Active",
      agreementStartISO: activateForm.agreementStartISO,
      billingCycle: activateForm.billingCycle,
      paymentCycle: activateForm.paymentCycle,
      claimsSubmissionSchedule: activateForm.claimsSubmissionSchedule,
      pricingRules: {
        consultation: 0,
        eyeTest: 0,
        diagnostics: 0,
        optical: 0,
        lens: 0,
        frame: 0,
        drugs: 0,
        surgery: 0,
        procedure: 0,
      },
      claimsSettings: {
        submissionFormat: record.claimsSubmissionMethod === "API" ? "API payload" : record.claimsSubmissionMethod === "Email" ? "Spreadsheet" : "Portal export",
        requiredDocuments: ["Invoice summary"],
        batchingRules: "Monthly batch",
        approvalWorkflow: "Clinic review → Submit",
      },
    };

    setAgreements((prev) => [newAgreement, ...prev]);
    setSelectedHmoId(record.id);
    setIsActivateOpen(false);
  };

  const updateSelected = (next: ClinicHmoAgreement) => {
    setAgreements((prev) => prev.map((a) => (a.hmoId === next.hmoId ? next : a)));
  };

  const totalAgreements = agreements.length;
  const pausedAgreements = agreements.filter((a) => a.status === "Paused").length;
  const monthlyPricingEstimate = agreements.reduce((acc, a) => acc + a.pricingRules.consultation + a.pricingRules.eyeTest, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="HMO Management"
        description="Activate and configure Health Maintenance Organization agreements, pricing, and claims processing settings for your clinic."
        actions={[
          { label: "Activate HMO", onClick: () => setIsActivateOpen(true), variant: "primary", disabled: availableToActivate.length === 0 },
          { label: "Billing & finance", href: "/clinic/finance" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Activated HMOs</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalAgreements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Paused</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{pausedAgreements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Pricing sanity (estimate)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(monthlyPricingEstimate)}</p>
            <p className="mt-1 text-xs text-slate-500">Consultation + eye test totals across agreements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Activated HMOs</CardTitle>
            <p className="text-sm text-slate-500">{availableToActivate.length} available to activate</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HMO</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((a) => (
                  <TableRow
                    key={a.hmoId}
                    onClick={() => setSelectedHmoId(a.hmoId)}
                    className={selectedHmoId === a.hmoId ? "bg-sky-50" : undefined}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell className="font-medium">{a.hmoName}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell className="text-slate-600">{a.billingCycle}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Clinic–HMO agreement</CardTitle>
            {selected ? <div className="shrink-0">{statusBadge(selected.status)}</div> : null}
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-slate-500">
                Select an activated HMO to configure agreement settings.
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">General settings</h3>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelected({
                          ...selected,
                          status: selected.status === "Active" ? "Paused" : "Active",
                        })
                      }
                      className="text-sm font-medium text-sky-700 hover:text-sky-800"
                    >
                      {selected.status === "Active" ? "Pause" : "Activate"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Display Name</label>
                      <input
                        value={selected.hmoName}
                        onChange={(e) => updateSelected({ ...selected, hmoName: e.target.value })}
                        className={inputClassName()}
                        placeholder="Custom HMO Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Agreement start</label>
                      <input
                        value={selected.agreementStartISO}
                        onChange={(e) => updateSelected({ ...selected, agreementStartISO: e.target.value })}
                        className={inputClassName()}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Agreement end (optional)</label>
                      <input
                        value={selected.agreementEndISO ?? ""}
                        onChange={(e) => updateSelected({ ...selected, agreementEndISO: e.target.value || undefined })}
                        className={inputClassName()}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Billing cycle</label>
                      <select
                        value={selected.billingCycle}
                        onChange={(e) =>
                          updateSelected({ ...selected, billingCycle: e.target.value as ClinicHmoAgreement["billingCycle"] })
                        }
                        className={inputClassName()}
                      >
                        <option value="Per visit">Per visit</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Payment cycle</label>
                      <select
                        value={selected.paymentCycle}
                        onChange={(e) =>
                          updateSelected({ ...selected, paymentCycle: e.target.value as ClinicHmoAgreement["paymentCycle"] })
                        }
                        className={inputClassName()}
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Claims submission schedule</label>
                      <select
                        value={selected.claimsSubmissionSchedule}
                        onChange={(e) =>
                          updateSelected({
                            ...selected,
                            claimsSubmissionSchedule: e.target.value as ClinicHmoAgreement["claimsSubmissionSchedule"],
                          })
                        }
                        className={inputClassName()}
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Pricing rules (clinic-specific)</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Consultation</label>
                      {numberField(selected.pricingRules.consultation, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, consultation: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Eye test</label>
                      {numberField(selected.pricingRules.eyeTest, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, eyeTest: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Diagnostics</label>
                      {numberField(selected.pricingRules.diagnostics, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, diagnostics: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Lens</label>
                      {numberField(selected.pricingRules.lens, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, lens: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Frame</label>
                      {numberField(selected.pricingRules.frame, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, frame: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Drugs</label>
                      {numberField(selected.pricingRules.drugs, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, drugs: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Surgery</label>
                      {numberField(selected.pricingRules.surgery, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, surgery: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Procedure</label>
                      {numberField(selected.pricingRules.procedure, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, procedure: v } })
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Optical (misc)</label>
                      {numberField(selected.pricingRules.optical, (v) =>
                        updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, optical: v } })
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    These are clinic-specific rates for the same HMO (as required by the blueprint).
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Claims settings</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Submission format</label>
                      <select
                        value={selected.claimsSettings.submissionFormat}
                        onChange={(e) =>
                          updateSelected({
                            ...selected,
                            claimsSettings: { ...selected.claimsSettings, submissionFormat: e.target.value as ClinicHmoAgreement["claimsSettings"]["submissionFormat"] },
                          })
                        }
                        className={inputClassName()}
                      >
                        <option value="Spreadsheet">Spreadsheet</option>
                        <option value="Portal export">Portal export</option>
                        <option value="API payload">API payload</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Batching rules</label>
                      <select
                        value={selected.claimsSettings.batchingRules}
                        onChange={(e) =>
                          updateSelected({
                            ...selected,
                            claimsSettings: { ...selected.claimsSettings, batchingRules: e.target.value as ClinicHmoAgreement["claimsSettings"]["batchingRules"] },
                          })
                        }
                        className={inputClassName()}
                      >
                        <option value="Per patient">Per patient</option>
                        <option value="Per visit">Per visit</option>
                        <option value="Monthly batch">Monthly batch</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Approval workflow</label>
                      <select
                        value={selected.claimsSettings.approvalWorkflow}
                        onChange={(e) =>
                          updateSelected({
                            ...selected,
                            claimsSettings: { ...selected.claimsSettings, approvalWorkflow: e.target.value as ClinicHmoAgreement["claimsSettings"]["approvalWorkflow"] },
                          })
                        }
                        className={inputClassName()}
                      >
                        <option value="Clinic review → Submit">Clinic review → Submit</option>
                        <option value="Submit directly">Submit directly</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Required supporting documents</label>
                      <input
                        value={selected.claimsSettings.requiredDocuments.join(", ")}
                        onChange={(e) =>
                          updateSelected({
                            ...selected,
                            claimsSettings: {
                              ...selected.claimsSettings,
                              requiredDocuments: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            },
                          })
                        }
                        className={inputClassName()}
                        placeholder="e.g., Invoice summary, Authorization"
                      />
                      <p className="mt-1 text-xs text-slate-500">Comma-separated list</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isActivateOpen} onClose={() => setIsActivateOpen(false)} title="Activate HMO">
        {availableToActivate.length === 0 ? (
          <div className="text-sm text-slate-600">No additional HMOs are available to activate right now.</div>
        ) : (
          <form onSubmit={activate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Select HMO</label>
              <select
                value={activateForm.hmoId}
                onChange={(e) => setActivateForm((p) => ({ ...p, hmoId: e.target.value }))}
                className={inputClassName()}
              >
                {availableToActivate.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.shortCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Agreement start</label>
                <input
                  value={activateForm.agreementStartISO}
                  onChange={(e) => setActivateForm((p) => ({ ...p, agreementStartISO: e.target.value }))}
                  className={inputClassName()}
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Billing cycle</label>
                <select
                  value={activateForm.billingCycle}
                  onChange={(e) =>
                    setActivateForm((p) => ({ ...p, billingCycle: e.target.value as ClinicHmoAgreement["billingCycle"] }))
                  }
                  className={inputClassName()}
                >
                  <option value="Per visit">Per visit</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Payment cycle</label>
                <select
                  value={activateForm.paymentCycle}
                  onChange={(e) =>
                    setActivateForm((p) => ({ ...p, paymentCycle: e.target.value as ClinicHmoAgreement["paymentCycle"] }))
                  }
                  className={inputClassName()}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Claims schedule</label>
                <select
                  value={activateForm.claimsSubmissionSchedule}
                  onChange={(e) =>
                    setActivateForm((p) => ({
                      ...p,
                      claimsSubmissionSchedule: e.target.value as ClinicHmoAgreement["claimsSubmissionSchedule"],
                    }))
                  }
                  className={inputClassName()}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Master HMO defaults</p>
              <div className="mt-2 space-y-1">
                {(() => {
                  const h = hmoMasterRecords.find((x) => x.id === activateForm.hmoId);
                  if (!h) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Claims method</span>
                        <span className="flex items-center gap-2">{methodBadge(h.claimsSubmissionMethod)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment cycle</span>
                        <span className="font-medium">{h.paymentCycle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Authorization</span>
                        <span className="font-medium">{h.requiresAuthorization ? "Required" : "Not required"}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsActivateOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
              >
                Activate HMO
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
