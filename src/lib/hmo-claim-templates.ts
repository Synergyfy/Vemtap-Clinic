import type { HmoClaim, HmoClaimItem } from '@/store/hmoAdvancedStore';

export interface NhiaClaimForm {
  header: {
    hmoName: string;
    hmoCode: string;
    claimDate: string;
    batchRef: string;
  };
  patient: {
    name: string;
    id: string;
    policyNumber?: string;
  };
  diagnosis: string;
  services: {
    code: string;
    description: string;
    qty: number;
    unitPrice: number;
    total: number;
  }[];
  totals: {
    subtotal: number;
    discount: number;
    grandTotal: number;
  };
}

export function generateNhiaClaimForm(claim: HmoClaim): NhiaClaimForm {
  return {
    header: {
      hmoName: claim.hmoName,
      hmoCode: claim.hmoId,
      claimDate: claim.submittedDate || new Date().toISOString().slice(0, 10),
      batchRef: `BATCH-${claim.hmoId}-${new Date().toISOString().slice(0, 7)}`,
    },
    patient: {
      name: claim.patientName,
      id: claim.patientId,
    },
    diagnosis: claim.diagnosis,
    services: claim.items.map((item) => ({
      code: item.code,
      description: item.description,
      qty: 1,
      unitPrice: item.amount,
      total: item.amount,
    })),
    totals: {
      subtotal: claim.total,
      discount: 0,
      grandTotal: claim.total,
    },
  };
}

export function formatClaimForExport(claim: HmoClaim): Record<string, string> {
  const items = claim.items.map((i) => `${i.code} - ${i.description} (₦${i.amount.toLocaleString()})`).join('; ');
  return {
    'Claim ID': claim.id,
    'HMO': claim.hmoName,
    'Patient': claim.patientName,
    'Diagnosis': claim.diagnosis,
    'Items': items,
    'Total': `₦${claim.total.toLocaleString()}`,
    'Status': claim.status,
    'Submitted': claim.submittedDate || '-',
    'Paid': claim.paidDate || '-',
    'Paid Amount': claim.paidAmount ? `₦${claim.paidAmount.toLocaleString()}` : '-',
  };
}
