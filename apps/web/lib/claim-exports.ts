import type { HmoClaim, HmoRemittance, HmoAppeal } from '@/store/hmoAdvancedStore';

export function exportCsv(data: Record<string, string>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportClaimsCsv(claims: HmoClaim[]) {
  const data = claims.map((c) => ({
    'Claim ID': c.id,
    HMO: c.hmoName,
    Patient: c.patientName,
    Diagnosis: c.diagnosis,
    Total: String(c.total),
    Status: c.status,
    Submitted: c.submittedDate || '',
    'Paid Amount': c.paidAmount ? String(c.paidAmount) : '',
  }));
  exportCsv(data, `hmo_claims_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportRemittancesCsv(remittances: HmoRemittance[]) {
  const data = remittances.map((r) => ({
    Reference: r.reference,
    HMO: r.hmoName,
    Amount: String(r.amount),
    Received: r.receivedDate,
    Status: r.status,
    'Matched Claims': r.matchedClaimIds.join('; '),
  }));
  exportCsv(data, `hmo_remittances_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportAppealsCsv(appeals: HmoAppeal[]) {
  const data = appeals.map((a) => ({
    'Appeal ID': a.id,
    'Claim ID': a.claimId,
    HMO: a.hmoName,
    Patient: a.patientName,
    Reason: a.reason,
    Status: a.status,
    Submitted: a.submittedDate || '',
    Response: a.response || '',
  }));
  exportCsv(data, `hmo_appeals_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function generateClaimTextSummary(claims: HmoClaim[]): string {
  const lines = [
    '='.repeat(50),
    'HMO CLAIMS SUMMARY',
    '='.repeat(50),
    `Generated: ${new Date().toLocaleDateString()}`,
    `Total Claims: ${claims.length}`,
    `Total Value: ₦${claims.reduce((s, c) => s + c.total, 0).toLocaleString()}`,
    '',
    ...claims.map((c) =>
      [
        `  ${c.id} | ${c.hmoName} | ${c.patientName}`,
        `  Diagnosis: ${c.diagnosis}`,
        `  Amount: ₦${c.total.toLocaleString()} | Status: ${c.status}`,
        '  ' + '-'.repeat(40),
      ].join('\n')
    ),
  ].join('\n');
  return lines;
}
