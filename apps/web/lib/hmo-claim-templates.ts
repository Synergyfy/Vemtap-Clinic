import type { HmoClaim } from '@/services/hmo.service';

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
      hmoName: claim.hmo?.name ?? '',
      hmoCode: claim.hmoId,
      claimDate: claim.submittedDate || new Date().toISOString().slice(0, 10),
      batchRef: `BATCH-${claim.hmoId}-${new Date().toISOString().slice(0, 7)}`,
    },
    patient: {
      name: claim.patient?.firstName + ' ' + claim.patient?.lastName ?? '',
      id: claim.patientId,
    },
    diagnosis: claim.diagnosis ?? '',
    services: [], // items not available on HmoClaim type
    totals: {
      subtotal: claim.amountClaimed,
      discount: 0,
      grandTotal: claim.amountClaimed,
    },
  };
}

export function formatClaimForExport(claim: HmoClaim): Record<string, string> {
  return {
    'Claim ID': claim.id,
    'HMO': claim.hmo?.name ?? claim.hmoId,
    'Patient': claim.patient?.firstName + ' ' + claim.patient?.lastName ?? claim.patientId,
    'Diagnosis': claim.diagnosis ?? '',
    'Items': '',
    'Total': `₦${claim.amountClaimed.toLocaleString()}`,
    'Status': claim.status,
    'Submitted': claim.submittedDate || '-',
    'Paid': claim.reviewedDate || '-',
    'Paid Amount': claim.amountApproved ? `₦${claim.amountApproved.toLocaleString()}` : '-',
  };
}
