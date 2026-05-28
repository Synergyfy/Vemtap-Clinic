export type ClinicShift = {
  id: string;
  staffName: string;
  role: string;
  day: string;
  shift: "Morning" | "Afternoon" | "Night";
};

export type RolePermission = {
  role: string;
  permissions: string[];
};

export const clinicShifts: ClinicShift[] = [
  { id: "SH-001", staffName: "Dr. A. Bello", role: "Doctor", day: "Monday", shift: "Morning" },
  { id: "SH-002", staffName: "Nurse R. Okeke", role: "Nurse", day: "Monday", shift: "Morning" },
];

export const clinicRolePermissions: RolePermission[] = [
  { role: "Doctor", permissions: ["view_patients", "create_consultation", "prescribe_drugs"] },
  { role: "Receptionist", permissions: ["view_patients", "register_patient", "manage_queue"] },
];

export type BranchStaffMapping = {
  branchId: string;
  staffCount: number;
  onDuty: number;
};

export type BranchQueueSummary = {
  branchId: string;
  waiting: number;
  inService: number;
  avgWaitTime: number;
};

export const branchStaffData: BranchStaffMapping[] = [
  { branchId: "B-001", staffCount: 15, onDuty: 10 },
  { branchId: "B-002", staffCount: 8, onDuty: 5 },
  { branchId: "B-003", staffCount: 5, onDuty: 3 },
];

export const branchQueueData: BranchQueueSummary[] = [
  { branchId: "B-001", waiting: 12, inService: 4, avgWaitTime: 25 },
  { branchId: "B-002", waiting: 5, inService: 2, avgWaitTime: 15 },
  { branchId: "B-003", waiting: 2, inService: 1, avgWaitTime: 10 },
];

export type ClinicStaff = {
  id: string;
  name: string;
  email: string;
  role: "Doctor" | "Nurse" | "Receptionist" | "Optometrist" | "Optician" | "Pharmacist" | "Cashier";
  department: string;
  status: "Active" | "Inactive";
};

export type ClinicBranch = {
  id: string;
  name: string;
  location: string;
  manager: string;
  revenue: number;
  activePatients: number;
  status: "Active" | "Closed";
};

export const clinicStaff: ClinicStaff[] = [
  { id: "STAFF-001", name: "Dr. A. Bello", email: "a.bello@vemtap.com", role: "Doctor", department: "Clinic", status: "Active" },
  { id: "STAFF-002", name: "Optom. S. Danladi", email: "s.danladi@vemtap.com", role: "Optometrist", department: "Clinic", status: "Active" },
  { id: "STAFF-003", name: "Nurse R. Okeke", email: "r.okeke@vemtap.com", role: "Nurse", department: "Clinic", status: "Active" },
  { id: "STAFF-004", name: "Amina Sule", email: "a.sule@vemtap.com", role: "Receptionist", department: "Front desk", status: "Active" },
];

export const clinicBranches: ClinicBranch[] = [
  { id: "B-001", name: "Vemtap Main", location: "Victoria Island", manager: "Dr. A. Bello", revenue: 2500000, activePatients: 450, status: "Active" },
  { id: "B-002", name: "Vemtap Ikeja", location: "Ikeja GRA", manager: "Dr. E. Nwachukwu", revenue: 1200000, activePatients: 210, status: "Active" },
  { id: "B-003", name: "Vemtap Lekki", location: "Lekki Phase 1", manager: "Optom. S. Danladi", revenue: 550000, activePatients: 95, status: "Active" },
];

export type ClinicPatient = {
  id: string;
  name: string;
  age: number;
  sex: "Female" | "Male";
  phone: string;
  lastVisitISO: string;
  status: "New" | "Active" | "Inactive";
};

export type ClinicPatientNote = {
  id: string;
  patientId: string;
  createdISO: string;
  author: string;
  note: string;
  tag: "General" | "Clinical" | "Billing" | "Optical" | "HMO";
};

export type ClinicAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  dateISO?: string; // "2026-05-27"
  startTime: string; // "09:30"
  endTime?: string; // "10:00"
  service: "Consultation" | "Refraction" | "Optical" | "Surgery Review";
  provider: string;
  kind?: "Regular" | "Follow-up" | "Walk-in";
  reason?: string;
  createdISO?: string;
  rescheduledFromId?: string;
  status: "Scheduled" | "Checked-in" | "In-progress" | "Completed" | "Cancelled" | "Missed";
};

export type ClinicConsultation = {
  id: string;
  patientId: string;
  provider: string;
  visitISO: string;
  chiefComplaint: string;
  diagnosis: string;
  plan: string;
  status: "Open" | "Closed";
};

export type ClinicEyeTest = {
  id: string;
  patientId: string;
  testISO: string;
  type: "Visual acuity" | "IOP" | "Refraction" | "Fundus" | "OCT";
  summary: string;
  performedBy: string;
};

export type ClinicPrescription = {
  id: string;
  patientId: string;
  prescribedISO: string;
  provider: string;
  items: { name: string; dose: string; duration: string }[];
  status: "Active" | "Completed" | "Cancelled";
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
  payerType: "Private" | "HMO";
  amount: number; // NGN
  method: "POS" | "Transfer" | "Cash";
  status: "Paid" | "Pending" | "Voided";
  createdISO: string;
};

export type ClinicStaffOnDuty = {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Receptionist" | "Optometrist" | "Optician" | "Pharmacist" | "Cashier";
  department: "Front desk" | "Clinic" | "Optical" | "Pharmacy" | "Billing";
  shift: "Morning" | "Afternoon" | "Night";
  status: "On duty" | "Break" | "Off duty";
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

export type ClinicFollowUp = {
  id: string;
  patientId: string;
  dueISO: string;
  reason: string;
  status: "Pending" | "Scheduled" | "Done";
};

export type ClinicPatientDocument = {
  id: string;
  patientId: string;
  name: string;
  type: "Scan" | "Lab result" | "Imaging" | "Consent" | "Other";
  uploadedISO: string;
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

export const clinicPatientNotes: ClinicPatientNote[] = [
  {
    id: "N-001",
    patientId: "P-001",
    createdISO: "2026-05-24T12:10:00",
    author: "Reception",
    note: "Patient requested evening pickup time for spectacles.",
    tag: "Optical",
  },
  {
    id: "N-002",
    patientId: "P-003",
    createdISO: "2026-05-26T09:05:00",
    author: "Nurse R. Okeke",
    note: "Vitals taken; patient reports itchy eyes for 3 days.",
    tag: "Clinical",
  },
  {
    id: "N-003",
    patientId: "P-004",
    createdISO: "2026-05-20T10:30:00",
    author: "Billing",
    note: "HMO pre-authorization required before procedure booking.",
    tag: "HMO",
  },
];

export const clinicConsultations: ClinicConsultation[] = [
  {
    id: "C-2001",
    patientId: "P-003",
    provider: "Dr. A. Bello",
    visitISO: "2026-05-26",
    chiefComplaint: "Redness and tearing",
    diagnosis: "Allergic conjunctivitis",
    plan: "Start lubricating tears; review in 1 week.",
    status: "Open",
  },
  {
    id: "C-2002",
    patientId: "P-001",
    provider: "Dr. E. Nwachukwu",
    visitISO: "2026-05-24",
    chiefComplaint: "Blurred distance vision",
    diagnosis: "Refractive error",
    plan: "Proceed to refraction; discuss lens options.",
    status: "Closed",
  },
];

export const clinicEyeTests: ClinicEyeTest[] = [
  {
    id: "T-3101",
    patientId: "P-001",
    testISO: "2026-05-24",
    type: "Refraction",
    summary: "Myopia OU; updated prescription recommended.",
    performedBy: "Optom. S. Danladi",
  },
  {
    id: "T-3102",
    patientId: "P-003",
    testISO: "2026-05-26",
    type: "Visual acuity",
    summary: "VA 6/9 OD, 6/9 OS; no acute deficits.",
    performedBy: "Nurse R. Okeke",
  },
];

export const clinicPrescriptions: ClinicPrescription[] = [
  {
    id: "RX-501",
    patientId: "P-003",
    prescribedISO: "2026-05-26",
    provider: "Dr. A. Bello",
    items: [
      { name: "Lubricating tears", dose: "1 drop OU TID", duration: "7 days" },
      { name: "Ciprofloxacin eye drops", dose: "1 drop OU BID", duration: "5 days" },
    ],
    status: "Active",
  },
];

export const clinicAppointmentsToday: ClinicAppointment[] = [
  { id: "A-1001", patientId: "P-003", patientName: "Fatima Yusuf", dateISO: "2026-05-27", startTime: "09:00", endTime: "09:30", service: "Consultation", provider: "Dr. A. Bello", kind: "Regular", status: "Checked-in", createdISO: "2026-05-26T18:30:00" },
  { id: "A-1002", patientId: "P-001", patientName: "Adesuwa Okoro", dateISO: "2026-05-27", startTime: "09:30", endTime: "10:00", service: "Refraction", provider: "Optom. S. Danladi", kind: "Regular", status: "In-progress", createdISO: "2026-05-26T16:05:00" },
  { id: "A-1003", patientId: "P-004", patientName: "Ifeanyi Nwosu", dateISO: "2026-05-27", startTime: "10:00", endTime: "10:30", service: "Surgery Review", provider: "Dr. E. Nwachukwu", kind: "Follow-up", reason: "Post-op review", status: "Scheduled", createdISO: "2026-05-25T12:12:00" },
  { id: "A-1004", patientId: "P-002", patientName: "Chidi Okafor", dateISO: "2026-05-27", startTime: "11:00", endTime: "11:20", service: "Optical", provider: "Optical Desk", kind: "Regular", status: "Scheduled", createdISO: "2026-05-26T10:40:00" },
  { id: "A-1005", patientId: "P-006", patientName: "Maryam Sule", dateISO: "2026-05-27", startTime: "12:30", endTime: "13:00", service: "Consultation", provider: "Dr. A. Bello", kind: "Walk-in", reason: "Itchy eyes", status: "Scheduled", createdISO: "2026-05-27T08:10:00" },
];

export const clinicAppointmentsUpcoming: ClinicAppointment[] = [
  { id: "A-1010", patientId: "P-001", patientName: "Adesuwa Okoro", dateISO: "2026-05-29", startTime: "10:30", endTime: "11:00", service: "Optical", provider: "Optical Desk", kind: "Follow-up", reason: "Frame fitting", status: "Scheduled", createdISO: "2026-05-27T09:00:00" },
  { id: "A-1011", patientId: "P-003", patientName: "Fatima Yusuf", dateISO: "2026-06-02", startTime: "09:15", endTime: "09:45", service: "Consultation", provider: "Dr. A. Bello", kind: "Follow-up", reason: "Review conjunctivitis", status: "Scheduled", createdISO: "2026-05-27T09:20:00" },
  { id: "A-1012", patientId: "P-002", patientName: "Chidi Okafor", dateISO: "2026-05-30", startTime: "12:00", endTime: "12:30", service: "Refraction", provider: "Optom. S. Danladi", kind: "Regular", status: "Scheduled", createdISO: "2026-05-26T14:33:00" },
];

export const clinicAppointmentsMissed: ClinicAppointment[] = [
  { id: "A-0990", patientId: "P-005", patientName: "Kemi Balogun", dateISO: "2026-05-25", startTime: "09:00", endTime: "09:30", service: "Consultation", provider: "Dr. A. Bello", kind: "Regular", status: "Missed", createdISO: "2026-05-24T13:10:00" },
  { id: "A-0991", patientId: "P-004", patientName: "Ifeanyi Nwosu", dateISO: "2026-05-26", startTime: "11:15", endTime: "11:45", service: "Surgery Review", provider: "Dr. E. Nwachukwu", kind: "Follow-up", reason: "Review", status: "Missed", createdISO: "2026-05-24T09:45:00" },
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
  { id: "INV-9001", patientName: "Adesuwa Okoro", payerType: "Private", amount: 35000, method: "POS", status: "Paid", createdISO: "2026-05-26T10:14:00" },
  { id: "INV-9002", patientName: "Fatima Yusuf", payerType: "HMO", amount: 25000, method: "Transfer", status: "Pending", createdISO: "2026-05-26T09:22:00" },
  { id: "INV-9003", patientName: "Chidi Okafor", payerType: "Private", amount: 85000, method: "POS", status: "Paid", createdISO: "2026-05-26T11:03:00" },
  { id: "INV-9004", patientName: "Ifeanyi Nwosu", payerType: "HMO", amount: 60000, method: "Transfer", status: "Paid", createdISO: "2026-05-26T12:05:00" },
];

export const clinicHmoClaims: ClinicHmoClaim[] = [
  { id: "CLM-1101", hmo: "Hygeia HMO", patientName: "Ifeanyi Nwosu", amount: 120000, status: "Submitted", submittedISO: "2026-05-24" },
  { id: "CLM-1102", hmo: "Reliance HMO", patientName: "Kemi Balogun", amount: 45000, status: "Queried", submittedISO: "2026-05-20" },
  { id: "CLM-1103", hmo: "AXA Mansard", patientName: "Adesuwa Okoro", amount: 60000, status: "Approved", submittedISO: "2026-05-18" },
];

export const clinicStaffOnDuty: ClinicStaffOnDuty[] = [
  { id: "S-001", name: "Dr. A. Bello", role: "Doctor", department: "Clinic", shift: "Morning", status: "On duty" },
  { id: "S-002", name: "Optom. S. Danladi", role: "Optometrist", department: "Clinic", shift: "Morning", status: "On duty" },
  { id: "S-003", name: "Nurse R. Okeke", role: "Nurse", department: "Clinic", shift: "Morning", status: "Break" },
  { id: "S-004", name: "Front Desk Amina", role: "Receptionist", department: "Front desk", shift: "Morning", status: "On duty" },
  { id: "S-005", name: "Optical Desk", role: "Optician", department: "Optical", shift: "Morning", status: "On duty" },
  { id: "S-006", name: "Pharm. T. Ibrahim", role: "Pharmacist", department: "Pharmacy", shift: "Morning", status: "On duty" },
  { id: "S-007", name: "Cashier L. Adeyemi", role: "Cashier", department: "Billing", shift: "Morning", status: "On duty" },
];

export const clinicSupportTickets: ClinicSupportTicket[] = [
  { id: "SUP-701", subject: "POS reversal not reflecting", priority: "High", status: "Open", updatedISO: "2026-05-26T12:40:00" },
  { id: "SUP-702", subject: "Appointment reminders not sending", priority: "Medium", status: "Awaiting user", updatedISO: "2026-05-26T10:05:00" },
  { id: "SUP-703", subject: "Add new HMO tariff list", priority: "Low", status: "Resolved", updatedISO: "2026-05-25T15:11:00" },
];

export const clinicFollowUps: ClinicFollowUp[] = [
  { id: "FU-001", patientId: "P-003", dueISO: "2026-06-02", reason: "Review conjunctivitis symptoms", status: "Pending" },
  { id: "FU-002", patientId: "P-001", dueISO: "2026-06-10", reason: "Glasses pickup / fitting", status: "Scheduled" },
];

export const clinicPatientDocuments: ClinicPatientDocument[] = [
  { id: "D-001", patientId: "P-001", name: "Refraction sheet", type: "Scan", uploadedISO: "2026-05-24T13:05:00" },
  { id: "D-002", patientId: "P-004", name: "HMO authorization", type: "Consent", uploadedISO: "2026-05-20T11:00:00" },
];

export const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
