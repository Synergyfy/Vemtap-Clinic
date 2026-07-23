import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ClaimStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'queried' | 'rejected';
export type AppealStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'dismissed';
export type RemittanceStatus = 'pending' | 'partial' | 'reconciled';

export interface HmoClaimItem {
  code: string;
  description: string;
  amount: number;
}

export interface HmoClaim {
  id: string;
  hmoId: string;
  hmoName: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  items: HmoClaimItem[];
  total: number;
  status: ClaimStatus;
  submittedDate: string;
  approvedDate?: string;
  paidDate?: string;
  paidAmount?: number;
  reference?: string;
  notes?: string;
}

export interface HmoRemittance {
  id: string;
  hmoId: string;
  hmoName: string;
  receivedDate: string;
  amount: number;
  reference: string;
  matchedClaimIds: string[];
  status: RemittanceStatus;
  notes: string;
}

export interface HmoAppeal {
  id: string;
  claimId: string;
  hmoName: string;
  patientName: string;
  reason: string;
  supportingNotes: string;
  status: AppealStatus;
  submittedDate: string;
  responseDate?: string;
  response?: string;
}

const initialClaims: HmoClaim[] = [
  { id: 'HMC-1001', hmoId: 'HMO-001', hmoName: 'AXA Mansard', patientId: 'PT-001', patientName: 'Chioma Okafor', diagnosis: 'Cataract (both eyes)', items: [{ code: 'SURG-CAT', description: 'Cataract Surgery (both eyes)', amount: 300000 }], total: 300000, status: 'paid', submittedDate: '2026-03-01', paidDate: '2026-03-28', paidAmount: 300000, reference: 'AXA-PAY-2026-031', notes: '' },
  { id: 'HMC-1002', hmoId: 'HMO-002', hmoName: 'Hygeia HMO', patientId: 'PT-003', patientName: 'Emeka Nwosu', diagnosis: 'Glaucoma screening', items: [{ code: 'CONS-GEN', description: 'General Consultation', amount: 5000 }, { code: 'TEST-GLAU', description: 'Glaucoma Screening', amount: 7000 }], total: 12000, status: 'submitted', submittedDate: '2026-04-10', notes: '' },
  { id: 'HMC-1003', hmoId: 'HMO-003', hmoName: 'NHIA', patientId: 'PT-005', patientName: 'Aisha Bello', diagnosis: 'Refractive error', items: [{ code: 'TEST-REF', description: 'Refraction Test', amount: 5000 }, { code: 'OPT-SV', description: 'Single Vision Lenses', amount: 15000 }], total: 20000, status: 'queried', submittedDate: '2026-04-01', notes: 'HMO requesting additional documentation for lens' },
  { id: 'HMC-1004', hmoId: 'HMO-001', hmoName: 'AXA Mansard', patientId: 'PT-007', patientName: 'David Adeleke', diagnosis: 'Dry eye syndrome', items: [{ code: 'CONS-GEN', description: 'General Consultation', amount: 5000 }, { code: 'PHARM-AT', description: 'Artificial Tears', amount: 2500 }], total: 7500, status: 'approved', submittedDate: '2026-04-15', approvedDate: '2026-04-22', notes: '' },
  { id: 'HMC-1005', hmoId: 'HMO-002', hmoName: 'Hygeia HMO', patientId: 'PT-009', patientName: 'Funke Akinyemi', diagnosis: 'LASIK evaluation', items: [{ code: 'CONS-SPEC', description: 'Specialist Consultation', amount: 10000 }, { code: 'TEST-CE', description: 'Comprehensive Eye Exam', amount: 8000 }], total: 18000, status: 'rejected', submittedDate: '2026-03-20', notes: 'Pre-existing condition exclusion applied' },
  { id: 'HMC-1006', hmoId: 'HMO-004', hmoName: 'Reliance HMO', patientId: 'PT-011', patientName: 'Grace Okonkwo', diagnosis: 'Diabetic retinopathy screening', items: [{ code: 'CONS-GEN', description: 'General Consultation', amount: 5000 }, { code: 'TEST-FUND', description: 'Fundoscopy', amount: 12000 }], total: 17000, status: 'draft', submittedDate: '', notes: 'Pending department approval' },
];

const initialRemittances: HmoRemittance[] = [
  { id: 'REM-001', hmoId: 'HMO-001', hmoName: 'AXA Mansard', receivedDate: '2026-03-28', amount: 300000, reference: 'AXA-PAY-2026-031', matchedClaimIds: ['HMC-1001'], status: 'reconciled', notes: 'Full settlement for HMC-1001' },
  { id: 'REM-002', hmoId: 'HMO-001', hmoName: 'AXA Mansard', receivedDate: '2026-04-22', amount: 5000, reference: 'AXA-PART-0422', matchedClaimIds: ['HMC-1004'], status: 'partial', notes: 'Partial — expected 7500, received 5000' },
];

const initialAppeals: HmoAppeal[] = [
  { id: 'APL-001', claimId: 'HMC-1005', hmoName: 'Hygeia HMO', patientName: 'Funke Akinyemi', reason: 'Pre-existing condition exclusion challenged — patient had no prior LASIK evaluation records', supportingNotes: 'Attached patient history showing no prior refractive surgery consultations', status: 'submitted', submittedDate: '2026-04-05' },
  { id: 'APL-002', claimId: 'HMC-1003', hmoName: 'NHIA', patientName: 'Aisha Bello', reason: 'Lens pricing within NHIA tariff schedule — provide updated NHIA lens pricing guide', supportingNotes: '', status: 'draft', submittedDate: '' },
];

interface HmoAdvancedState {
  claims: HmoClaim[];
  remittances: HmoRemittance[];
  appeals: HmoAppeal[];
  addClaim: (claim: Omit<HmoClaim, 'id' | 'status' | 'submittedDate' | 'paidDate'>) => void;
  updateClaimStatus: (id: string, status: ClaimStatus, extras?: Partial<HmoClaim>) => void;
  deleteClaim: (id: string) => void;
  addRemittance: (remit: Omit<HmoRemittance, 'id'>) => void;
  matchRemittance: (remitId: string, claimIds: string[]) => void;
  addAppeal: (appeal: Omit<HmoAppeal, 'id' | 'status' | 'submittedDate' | 'responseDate' | 'response'>) => void;
  updateAppeal: (id: string, updates: Partial<HmoAppeal>) => void;
  getClaimsByHmo: (hmoId: string) => HmoClaim[];
  getAgingBuckets: () => { label: string; range: string; total: number; count: number; claims: HmoClaim[] }[];
  getHmoTotals: () => { hmoName: string; total: number; paid: number; outstanding: number; count: number }[];
  resetAll: () => void;
}

export const useHmoAdvancedStore = create<HmoAdvancedState>()(
  persist(
    (set, get) => ({
      claims: initialClaims,
      remittances: initialRemittances,
      appeals: initialAppeals,

      addClaim: (data) => set((state) => ({
        claims: [...state.claims, {
          ...data,
          id: `HMC-${String(state.claims.length + 1001).padStart(4, '0')}`,
          status: 'draft' as ClaimStatus,
          submittedDate: '',
          notes: '',
        }],
      })),

      updateClaimStatus: (id, status, extras) => set((state) => ({
        claims: state.claims.map((c) => c.id === id ? { ...c, status, ...extras } : c),
      })),

      deleteClaim: (id) => set((state) => ({
        claims: state.claims.filter((c) => c.id !== id),
      })),

      addRemittance: (remit) => set((state) => ({
        remittances: [...state.remittances, { ...remit, id: `REM-${String(state.remittances.length + 1).padStart(3, '0')}` }],
      })),

      matchRemittance: (remitId, claimIds) => set((state) => ({
        remittances: state.remittances.map((r) =>
          r.id === remitId ? { ...r, matchedClaimIds: claimIds, status: 'reconciled' as RemittanceStatus } : r
        ),
      })),

      addAppeal: (data) => set((state) => ({
        appeals: [...state.appeals, {
          ...data,
          id: `APL-${String(state.appeals.length + 1).padStart(3, '0')}`,
          status: 'draft' as AppealStatus,
          submittedDate: '',
        }],
      })),

      updateAppeal: (id, updates) => set((state) => ({
        appeals: state.appeals.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),

      getClaimsByHmo: (hmoId) => get().claims.filter((c) => c.hmoId === hmoId),

      getAgingBuckets: () => {
        const now = new Date();
        const buckets = [
          { label: 'Current', range: '0–30 days', min: 0, max: 30 },
          { label: '31–60 days', range: '31–60 days', min: 31, max: 60 },
          { label: '61–90 days', range: '61–90 days', min: 61, max: 90 },
          { label: 'Over 90 days', range: '90+ days', min: 91, max: Infinity },
        ];
        return buckets.map((b) => {
          const claims = get().claims.filter((c) => {
            if (c.status === 'paid' || c.status === 'rejected') return false;
            const subDate = c.submittedDate || c.id; // fallback
            const days = subDate ? Math.floor((now.getTime() - new Date(subDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            return days >= b.min && days <= b.max;
          });
          return {
            label: b.label,
            range: b.range,
            total: claims.reduce((s, c) => s + c.total - (c.paidAmount || 0), 0),
            count: claims.length,
            claims,
          };
        });
      },

      getHmoTotals: () => {
        const hmoMap = new Map<string, { total: number; paid: number; count: number }>();
        get().claims.forEach((c) => {
          const prev = hmoMap.get(c.hmoName) || { total: 0, paid: 0, count: 0 };
          hmoMap.set(c.hmoName, {
            total: prev.total + c.total,
            paid: prev.paid + (c.paidAmount || 0),
            count: prev.count + 1,
          });
        });
        return Array.from(hmoMap.entries()).map(([hmoName, v]) => ({
          hmoName,
          total: v.total,
          paid: v.paid,
          outstanding: v.total - v.paid,
          count: v.count,
        }));
      },

      resetAll: () => set({ claims: initialClaims, remittances: initialRemittances, appeals: initialAppeals }),
    }),
    { name: 'vemtap-hmo-advanced-storage' }
  )
);

export const formatNGN = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

export const getDaysSince = (dateStr: string): number => {
  if (!dateStr) return 0;
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
};
