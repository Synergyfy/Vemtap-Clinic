import { PlanLimits, PlanReportingLevel } from '../entities/subscription-plan.entity';

export interface DefaultPlanDefinition {
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  sortOrder: number;
  limits: PlanLimits;
  features: string[];
}

const limits = (
  maxBranches: number | null,
  maxStaff: number | null,
  maxPatients: number | null,
  ocrPerMonth: number | null,
  whatsappPerMonth: number | null,
  storageMb: number | null,
  optical: boolean,
  reporting: PlanReportingLevel,
  apiIntegrations: boolean
): PlanLimits => ({
  maxBranches,
  maxStaff,
  maxPatients,
  ocrPerMonth,
  whatsappPerMonth,
  storageMb,
  optical,
  reporting,
  apiIntegrations,
});

/**
 * Seeded once on bootstrap. Prices are placeholders in NGN (Paystack's primary
 * currency); Super Admin can edit every value from the admin API.
 */
export const DEFAULT_PLANS: DefaultPlanDefinition[] = [
  {
    code: 'free',
    name: 'Free',
    description: 'A no-cost way to launch a clinic and explore the basics.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'NGN',
    sortOrder: 10,
    limits: limits(1, 2, 500, 0, 0, 500, false, 'basic', false),
    features: ['1 clinic', 'Basic patient records', 'Queue management', 'Email support'],
  },
  {
    code: 'starter',
    name: 'Starter',
    description: 'For small clinics starting their digital journey.',
    monthlyPrice: 25000,
    yearlyPrice: 250000,
    currency: 'NGN',
    sortOrder: 20,
    limits: limits(1, 5, 2000, 100, 200, 2048, false, 'basic', false),
    features: ['1 branch', '5 staff accounts', 'QR check-in', 'Basic HMO tracking'],
  },
  {
    code: 'growth',
    name: 'Growth',
    description: 'For busy clinics needing full automation.',
    monthlyPrice: 50000,
    yearlyPrice: 500000,
    currency: 'NGN',
    sortOrder: 30,
    limits: limits(3, 25, 20000, 1000, 2000, 20480, true, 'advanced', false),
    features: ['3 branches', 'Unlimited staff', 'Optical workflow', 'OCR scanning'],
  },
  {
    code: 'multi_branch',
    name: 'Multi-Branch',
    description: 'For expanding chains and hospitals.',
    monthlyPrice: 100000,
    yearlyPrice: 1000000,
    currency: 'NGN',
    sortOrder: 40,
    limits: limits(10, 100, 100000, 5000, 10000, 102400, true, 'bi', true),
    features: ['10 branches', 'Inter-branch transfer', 'Centralized BI', 'HMO remittance'],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large healthcare groups.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'NGN',
    sortOrder: 50,
    limits: limits(null, null, null, null, null, null, true, 'custom', true),
    features: ['Unlimited branches', 'Custom workflows', 'API access', 'White-labeling'],
  },
];
