export type RxStatus = "Active" | "Dispensing" | "Picked Up" | "Cancelled";

export type DrugCategory = "Antibiotic" | "Anti-inflammatory" | "Anti-glaucoma" | "Lubricant" | "Antihistamine" | "Steroid" | "Vitamin" | "Antiviral" | "Surgical" | "Other";

export type Drug = {
  id: string;
  name: string;
  category: DrugCategory;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
  expiryDate: string;
  location: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  drugs: { drugId: string; drugName: string; dosage: string; qty: number }[];
  status: RxStatus;
  date: string;
  notes?: string;
};

export type DispensingRecord = {
  id: string;
  prescriptionId: string;
  patientName: string;
  dispensedBy: string;
  dispensedAt: string;
  status: "Dispensed" | "Picked Up";
  drugs: { drugName: string; qty: number }[];
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  drugCategories: DrugCategory[];
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  supplierName: string;
  drugs: { name: string; qty: number; unitPrice: number }[];
  total: number;
  date: string;
  status: "Pending" | "Delivered" | "Cancelled";
};

export const drugs: Drug[] = [
  { id: "DR-001", name: "Ciprofloxacin 0.3% Eye Drops", category: "Antibiotic", quantity: 45, unit: "bottle", minStock: 20, unitPrice: 3500, expiryDate: "2027-06", location: "Fridge A1" },
  { id: "DR-002", name: "Tobramycin 0.3% Eye Drops", category: "Antibiotic", quantity: 12, unit: "bottle", minStock: 20, unitPrice: 4200, expiryDate: "2027-04", location: "Fridge A1" },
  { id: "DR-003", name: "Prednisolone Acetate 1%", category: "Steroid", quantity: 30, unit: "bottle", minStock: 15, unitPrice: 3800, expiryDate: "2026-12", location: "Shelf B2" },
  { id: "DR-004", name: "Timolol Maleate 0.5%", category: "Anti-glaucoma", quantity: 8, unit: "bottle", minStock: 15, unitPrice: 4500, expiryDate: "2027-08", location: "Shelf B1" },
  { id: "DR-005", name: "Latanoprost 0.005%", category: "Anti-glaucoma", quantity: 22, unit: "bottle", minStock: 10, unitPrice: 5500, expiryDate: "2027-03", location: "Shelf B1" },
  { id: "DR-006", name: "Artificial Tears (Systane)", category: "Lubricant", quantity: 60, unit: "bottle", minStock: 25, unitPrice: 2500, expiryDate: "2027-11", location: "Shelf C1" },
  { id: "DR-007", name: "Ketotifen Fumarate 0.025%", category: "Antihistamine", quantity: 18, unit: "bottle", minStock: 15, unitPrice: 3200, expiryDate: "2027-05", location: "Shelf C2" },
  { id: "DR-008", name: "Moxifloxacin 0.5%", category: "Antibiotic", quantity: 3, unit: "bottle", minStock: 15, unitPrice: 4800, expiryDate: "2026-09", location: "Fridge A1" },
  { id: "DR-009", name: "Dorzolamide 2%", category: "Anti-glaucoma", quantity: 14, unit: "bottle", minStock: 10, unitPrice: 5200, expiryDate: "2027-07", location: "Shelf B1" },
  { id: "DR-010", name: "Ofloxacin 0.3% Eye Drops", category: "Antibiotic", quantity: 5, unit: "bottle", minStock: 20, unitPrice: 3600, expiryDate: "2026-08", location: "Fridge A1" },
  { id: "DR-011", name: "Fluorometholone 0.1%", category: "Steroid", quantity: 25, unit: "bottle", minStock: 15, unitPrice: 3400, expiryDate: "2027-09", location: "Shelf B2" },
  { id: "DR-012", name: "Vitamin A Palmitate Gel", category: "Vitamin", quantity: 40, unit: "tube", minStock: 15, unitPrice: 2800, expiryDate: "2027-10", location: "Shelf C3" },
  { id: "DR-013", name: "Acyclovir 3% Eye Ointment", category: "Antiviral", quantity: 10, unit: "tube", minStock: 10, unitPrice: 4200, expiryDate: "2026-10", location: "Fridge A2" },
  { id: "DR-014", name: "Povidone Iodine 5%", category: "Surgical", quantity: 20, unit: "bottle", minStock: 10, unitPrice: 3000, expiryDate: "2027-02", location: "Shelf D1" },
  { id: "DR-015", name: "Cyclopentolate 1%", category: "Other", quantity: 7, unit: "bottle", minStock: 15, unitPrice: 3200, expiryDate: "2026-11", location: "Shelf B3" },
];

export const prescriptions: Prescription[] = [
  { id: "RX-001", patientId: "P-001", patientName: "Adesuwa Okoro", doctor: "Dr. A. Bello", drugs: [{ drugId: "DR-001", drugName: "Ciprofloxacin 0.3% Eye Drops", dosage: "1 gtt OU QID", qty: 1 }, { drugId: "DR-003", drugName: "Prednisolone Acetate 1%", dosage: "1 gtt OS TID", qty: 1 }], status: "Active", date: "2026-07-15", notes: "Post-op inflammation" },
  { id: "RX-002", patientId: "P-005", patientName: "Emeka Obi", doctor: "Dr. A. Bello", drugs: [{ drugId: "DR-006", drugName: "Artificial Tears (Systane)", dosage: "1 gtt OU PRN", qty: 2 }, { drugId: "DR-004", drugName: "Timolol Maleate 0.5%", dosage: "1 gtt OU BID", qty: 1 }], status: "Active", date: "2026-07-14" },
  { id: "RX-003", patientId: "P-008", patientName: "Sarah Ahmed", doctor: "Dr. E. Nwachukwu", drugs: [{ drugId: "DR-007", drugName: "Ketotifen Fumarate 0.025%", dosage: "1 gtt OU BID", qty: 1 }], status: "Dispensing", date: "2026-07-13" },
  { id: "RX-004", patientId: "P-012", patientName: "Chidi Okafor", doctor: "Dr. A. Bello", drugs: [{ drugId: "DR-005", drugName: "Latanoprost 0.005%", dosage: "1 gtt OU QHS", qty: 1 }, { drugId: "DR-009", drugName: "Dorzolamide 2%", dosage: "1 gtt OU TID", qty: 1 }], status: "Picked Up", date: "2026-07-12" },
  { id: "RX-005", patientId: "P-015", patientName: "Blessing Amos", doctor: "Dr. A. Bello", drugs: [{ drugId: "DR-012", drugName: "Vitamin A Palmitate Gel", dosage: "Apply OU BID", qty: 1 }], status: "Active", date: "2026-07-15" },
  { id: "RX-006", patientId: "P-018", patientName: "James Eze", doctor: "Dr. E. Nwachukwu", drugs: [{ drugId: "DR-010", drugName: "Ofloxacin 0.3% Eye Drops", dosage: "1 gtt OU QID", qty: 1 }, { drugId: "DR-011", drugName: "Fluorometholone 0.1%", dosage: "1 gtt OU TID", qty: 1 }], status: "Active", date: "2026-07-15" },
  { id: "RX-007", patientId: "P-020", patientName: "Fatima Yusuf", doctor: "Dr. A. Bello", drugs: [{ drugId: "DR-008", drugName: "Moxifloxacin 0.5%", dosage: "1 gtt OU QID", qty: 1 }], status: "Dispensing", date: "2026-07-14" },
  { id: "RX-008", patientId: "P-022", patientName: "John Doe", doctor: "Dr. E. Nwachukwu", drugs: [{ drugId: "DR-013", drugName: "Acyclovir 3% Eye Ointment", dosage: "Apply OS TID", qty: 1 }], status: "Picked Up", date: "2026-07-11" },
];

export const dispensingRecords: DispensingRecord[] = [
  { id: "DS-001", prescriptionId: "RX-003", patientName: "Sarah Ahmed", dispensedBy: "Pharm. P. Okafor", dispensedAt: "2026-07-14 10:30", status: "Dispensed", drugs: [{ drugName: "Ketotifen Fumarate 0.025%", qty: 1 }] },
  { id: "DS-002", prescriptionId: "RX-007", patientName: "Fatima Yusuf", dispensedBy: "Pharm. P. Okafor", dispensedAt: "2026-07-14 11:15", status: "Dispensed", drugs: [{ drugName: "Moxifloxacin 0.5%", qty: 1 }] },
  { id: "DS-003", prescriptionId: "RX-004", patientName: "Chidi Okafor", dispensedBy: "Pharm. P. Okafor", dispensedAt: "2026-07-12 14:00", status: "Picked Up", drugs: [{ drugName: "Latanoprost 0.005%", qty: 1 }, { drugName: "Dorzolamide 2%", qty: 1 }] },
  { id: "DS-004", prescriptionId: "RX-008", patientName: "John Doe", dispensedBy: "Pharm. P. Okafor", dispensedAt: "2026-07-11 09:45", status: "Picked Up", drugs: [{ drugName: "Acyclovir 3% Eye Ointment", qty: 1 }] },
];

export const suppliers: Supplier[] = [
  { id: "SUP-001", name: "MediVision Pharma Ltd", contact: "Mr. Adebayo", email: "orders@medivision.com", phone: "+234 800 MEDI", address: "12 Industrial Crescent, Ikeja", drugCategories: ["Antibiotic", "Steroid", "Anti-glaucoma", "Lubricant"] },
  { id: "SUP-002", name: "OptiCare Distributors", contact: "Mrs. Eze", email: "supply@opticare.ng", phone: "+234 800 OPTI", address: "45 Marina Road, Lagos", drugCategories: ["Antihistamine", "Antiviral", "Vitamin", "Other"] },
  { id: "SUP-003", name: "SurgicalEye Supplies", contact: "Dr. Nwachukwu", email: "info@surgicaleye.com", phone: "+234 800 EYES", address: "8 Hospital Road, Enugu", drugCategories: ["Surgical", "Antibiotic", "Steroid"] },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-001", supplierId: "SUP-001", supplierName: "MediVision Pharma Ltd", drugs: [{ name: "Ciprofloxacin 0.3% Eye Drops", qty: 50, unitPrice: 2500 }, { name: "Timolol Maleate 0.5%", qty: 30, unitPrice: 3200 }], total: 221000, date: "2026-07-10", status: "Delivered" },
  { id: "PO-002", supplierId: "SUP-002", supplierName: "OptiCare Distributors", drugs: [{ name: "Ketotifen Fumarate 0.025%", qty: 40, unitPrice: 2200 }], total: 88000, date: "2026-07-08", status: "Delivered" },
  { id: "PO-003", supplierId: "SUP-001", supplierName: "MediVision Pharma Ltd", drugs: [{ name: "Tobramycin 0.3% Eye Drops", qty: 30, unitPrice: 3000 }, { name: "Prednisolone Acetate 1%", qty: 25, unitPrice: 2600 }, { name: "Moxifloxacin 0.5%", qty: 20, unitPrice: 3500 }], total: 237000, date: "2026-07-14", status: "Pending" },
  { id: "PO-004", supplierId: "SUP-003", supplierName: "SurgicalEye Supplies", drugs: [{ name: "Povidone Iodine 5%", qty: 30, unitPrice: 2000 }], total: 60000, date: "2026-07-12", status: "Pending" },
];

export const lowStockDrugs = drugs.filter((d) => d.quantity <= d.minStock);
export const expiringSoon = drugs.filter((d) => {
  const [year, month] = d.expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1);
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  return expiry <= threeMonths;
});
