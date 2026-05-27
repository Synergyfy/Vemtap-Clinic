export type ClinicPatient = {
  id: string;
  name: string;
  age: number;
  sex: "Female" | "Male";
  phone: string;
  lastVisitISO: string;
  status: "New" | "Active" | "Inactive";
};

export type ClinicAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string; // "09:30"
  service: "Consultation" | "Refraction" | "Optical" | "Surgery Review";
  provider: string;
  status: "Scheduled" | "Checked-in" | "In-progress" | "Completed" | "Cancelled";
};

export type ClinicQueueItem = {
  id: string;
  patientId: string;
  patientName: string;
  stage: "Reception" | "Vitals" | "Consultation" | "Refraction" | "Optical" | "Billing";
  priority: "Normal" | "Urgent";
  waitMinutes: number;
  status: "Waiting" | "In-service" | "Done";
};

export type ClinicOpticalOrder = {
  id: string;
  patientId: string;
  patientName: string;
  lens: "Single Vision" | "Bifocal" | "Progressive";
  frame: "Patient-owned" | "Clinic stock";
  status: "Draft" | "In production" | "Ready" | "Dispensed";
  dueISO: string;
};

export type ClinicPharmacyItem = {
  sku: string;
  name: string;
  stock: number;
  reorderLevel: number;
  expiryISO: string;
  location: string;
};

export type ClinicInvoice = {
  id: string;
  patientName: string;
  amount: number; // NGN
  method: "POS" | "Transfer" | "Cash";
  status: "Paid" | "Pending" | "Voided";
  createdISO: string;
};

export type ClinicHmoClaim = {
  id: string;
  hmo: string;
  patientName: string;
  amount: number; // NGN
  status: "Draft" | "Submitted" | "Queried" | "Approved" | "Rejected" | "Paid";
  submittedISO: string;
};

export type HmoMasterRecord = {
  id: string;
  name: string;
  shortCode: string;
  status: "Active" | "Inactive";
  claimsSubmissionMethod: "Portal" | "Email" | "API";
  paymentCycle: "Weekly" | "Monthly" | "Quarterly";
  requiresAuthorization: boolean;
};

export type ClinicHmoAgreement = {
  hmoId: string;
  hmoName: string;
  status: "Active" | "Paused";
  agreementStartISO: string;
  agreementEndISO?: string;
  billingCycle: "Per visit" | "Monthly";
  paymentCycle: "Weekly" | "Monthly" | "Quarterly";
  claimsSubmissionSchedule: "Monthly" | "Bi-weekly" | "Weekly";
  pricingRules: {
    consultation: number;
    eyeTest: number;
    diagnostics: number;
    optical: number;
    lens: number;
    frame: number;
    drugs: number;
    surgery: number;
    procedure: number;
  };
  claimsSettings: {
    submissionFormat: "Spreadsheet" | "Portal export" | "API payload";
    requiredDocuments: string[];
    batchingRules: "Per patient" | "Per visit" | "Monthly batch";
    approvalWorkflow: "Clinic review → Submit" | "Submit directly";
  };
};

export type ClinicSupportTicket = {
  id: string;
  subject: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "Awaiting user" | "Resolved";
  updatedISO: string;
};

export const hmoMasterRecords: HmoMasterRecord[] = [
  {
    id: "HMO-001",
    name: "AXA Mansard",
    shortCode: "AXA",
    status: "Active",
    claimsSubmissionMethod: "Portal",
    paymentCycle: "Monthly",
    requiresAuthorization: true,
  },
  {
    id: "HMO-002",
    name: "Hygeia HMO",
    shortCode: "HYG",
    status: "Active",
    claimsSubmissionMethod: "Portal",
    paymentCycle: "Monthly",
    requiresAuthorization: true,
  },
  {
    id: "HMO-003",
    name: "NHIA",
    shortCode: "NHIA",
    status: "Active",
    claimsSubmissionMethod: "Email",
    paymentCycle: "Monthly",
    requiresAuthorization: false,
  },
  {
    id: "HMO-004",
    name: "Reliance HMO",
    shortCode: "RHL",
    status: "Active",
    claimsSubmissionMethod: "API",
    paymentCycle: "Monthly",
    requiresAuthorization: true,
  },
];

export const defaultClinicHmoAgreements: ClinicHmoAgreement[] = [
  {
    hmoId: "HMO-001",
    hmoName: "AXA Mansard",
    status: "Active",
    agreementStartISO: "2026-01-01",
    agreementEndISO: "2026-12-31",
    billingCycle: "Monthly",
    paymentCycle: "Monthly",
    claimsSubmissionSchedule: "Monthly",
    pricingRules: {
      consultation: 5000,
      eyeTest: 3500,
      diagnostics: 8000,
      optical: 0,
      lens: 15000,
      frame: 0,
      drugs: 6000,
      surgery: 120000,
      procedure: 25000,
    },
    claimsSettings: {
      submissionFormat: "Portal export",
      requiredDocuments: ["Encounter note", "Invoice summary"],
      batchingRules: "Monthly batch",
      approvalWorkflow: "Clinic review → Submit",
    },
  },
  {
    hmoId: "HMO-002",
    hmoName: "Hygeia HMO",
    status: "Active",
    agreementStartISO: "2026-02-01",
    billingCycle: "Monthly",
    paymentCycle: "Monthly",
    claimsSubmissionSchedule: "Monthly",
    pricingRules: {
      consultation: 4500,
      eyeTest: 3000,
      diagnostics: 7500,
      optical: 0,
      lens: 12000,
      frame: 0,
      drugs: 5500,
      surgery: 110000,
      procedure: 22000,
    },
    claimsSettings: {
      submissionFormat: "Spreadsheet",
      requiredDocuments: ["Authorization (if any)", "Invoice summary"],
      batchingRules: "Monthly batch",
      approvalWorkflow: "Clinic review → Submit",
    },
  },
];

export const clinicPatients: ClinicPatient[] = [
  { id: "P-001", name: "Adesuwa Okoro", age: 34, sex: "Female", phone: "0803 555 0192", lastVisitISO: "2026-05-24", status: "Active" },
  { id: "P-002", name: "Chidi Okafor", age: 48, sex: "Male", phone: "0802 111 4401", lastVisitISO: "2026-05-19", status: "Active" },
  { id: "P-003", name: "Fatima Yusuf", age: 22, sex: "Female", phone: "0701 900 7720", lastVisitISO: "2026-05-26", status: "New" },
  { id: "P-004", name: "Ifeanyi Nwosu", age: 57, sex: "Male", phone: "0806 221 0014", lastVisitISO: "2026-05-10", status: "Active" },
  { id: "P-005", name: "Kemi Balogun", age: 29, sex: "Female", phone: "0902 700 3011", lastVisitISO: "2026-04-28", status: "Inactive" },
];

export const clinicAppointmentsToday: ClinicAppointment[] = [
  { id: "A-1001", patientId: "P-003", patientName: "Fatima Yusuf", startTime: "09:00", service: "Consultation", provider: "Dr. A. Bello", status: "Checked-in" },
  { id: "A-1002", patientId: "P-001", patientName: "Adesuwa Okoro", startTime: "09:30", service: "Refraction", provider: "Optom. S. Danladi", status: "In-progress" },
  { id: "A-1003", patientId: "P-004", patientName: "Ifeanyi Nwosu", startTime: "10:00", service: "Surgery Review", provider: "Dr. E. Nwachukwu", status: "Scheduled" },
  { id: "A-1004", patientId: "P-002", patientName: "Chidi Okafor", startTime: "11:00", service: "Optical", provider: "Optical Desk", status: "Scheduled" },
  { id: "A-1005", patientId: "P-006", patientName: "Maryam Sule", startTime: "12:30", service: "Consultation", provider: "Dr. A. Bello", status: "Scheduled" },
];

export const clinicQueue: ClinicQueueItem[] = [
  { id: "Q-201", patientId: "P-003", patientName: "Fatima Yusuf", stage: "Consultation", priority: "Normal", waitMinutes: 12, status: "Waiting" },
  { id: "Q-202", patientId: "P-001", patientName: "Adesuwa Okoro", stage: "Refraction", priority: "Normal", waitMinutes: 4, status: "In-service" },
  { id: "Q-203", patientId: "P-007", patientName: "Uchenna Eze", stage: "Reception", priority: "Urgent", waitMinutes: 2, status: "Waiting" },
  { id: "Q-204", patientId: "P-002", patientName: "Chidi Okafor", stage: "Billing", priority: "Normal", waitMinutes: 7, status: "Waiting" },
];

export const clinicOpticalOrders: ClinicOpticalOrder[] = [
  { id: "O-3301", patientId: "P-002", patientName: "Chidi Okafor", lens: "Progressive", frame: "Clinic stock", status: "In production", dueISO: "2026-05-28" },
  { id: "O-3302", patientId: "P-001", patientName: "Adesuwa Okoro", lens: "Single Vision", frame: "Patient-owned", status: "Ready", dueISO: "2026-05-26" },
  { id: "O-3303", patientId: "P-008", patientName: "Amina Musa", lens: "Bifocal", frame: "Clinic stock", status: "Draft", dueISO: "2026-05-30" },
];

export const clinicPharmacyItems: ClinicPharmacyItem[] = [
  { sku: "DR-AT-001", name: "Atropine 1% (10ml)", stock: 7, reorderLevel: 10, expiryISO: "2026-11-01", location: "Shelf A3" },
  { sku: "DR-CP-010", name: "Ciprofloxacin eye drops", stock: 14, reorderLevel: 12, expiryISO: "2027-02-15", location: "Shelf B1" },
  { sku: "DR-LT-005", name: "Lubricating tears", stock: 4, reorderLevel: 8, expiryISO: "2026-07-20", location: "Shelf A1" },
  { sku: "DR-PD-022", name: "Prednisolone acetate", stock: 9, reorderLevel: 10, expiryISO: "2026-09-10", location: "Fridge 1" },
];

export const clinicInvoicesToday: ClinicInvoice[] = [
  { id: "INV-9001", patientName: "Adesuwa Okoro", amount: 35000, method: "POS", status: "Paid", createdISO: "2026-05-26T10:14:00" },
  { id: "INV-9002", patientName: "Fatima Yusuf", amount: 25000, method: "Transfer", status: "Pending", createdISO: "2026-05-26T09:22:00" },
  { id: "INV-9003", patientName: "Chidi Okafor", amount: 85000, method: "POS", status: "Paid", createdISO: "2026-05-26T11:03:00" },
];

export const clinicHmoClaims: ClinicHmoClaim[] = [
  { id: "CLM-1101", hmo: "Hygeia HMO", patientName: "Ifeanyi Nwosu", amount: 120000, status: "Submitted", submittedISO: "2026-05-24" },
  { id: "CLM-1102", hmo: "Reliance HMO", patientName: "Kemi Balogun", amount: 45000, status: "Queried", submittedISO: "2026-05-20" },
  { id: "CLM-1103", hmo: "AXA Mansard", patientName: "Adesuwa Okoro", amount: 60000, status: "Approved", submittedISO: "2026-05-18" },
];

export const clinicSupportTickets: ClinicSupportTicket[] = [
  { id: "SUP-701", subject: "POS reversal not reflecting", priority: "High", status: "Open", updatedISO: "2026-05-26T12:40:00" },
  { id: "SUP-702", subject: "Appointment reminders not sending", priority: "Medium", status: "Awaiting user", updatedISO: "2026-05-26T10:05:00" },
  { id: "SUP-703", subject: "Add new HMO tariff list", priority: "Low", status: "Resolved", updatedISO: "2026-05-25T15:11:00" },
];

export const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
