export type LensOrderStatus = "New" | "In Production" | "Ready" | "Delivered";

export type LensOrder = {
  id: string;
  patientId: string;
  patientName: string;
  orderDate: string;
  lensType: string;
  prescription: string;
  frameType: string;
  status: LensOrderStatus;
  estimatedReady: string;
  notes?: string;
};

export type InventoryCategory = "Frame" | "Lens" | "Accessory";

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  brand: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  location: string;
};

export type ProductionStage = "Order Received" | "Production Started" | "Quality Check" | "Ready for Pickup";

export type ProductionItem = {
  id: string;
  orderId: string;
  patientName: string;
  lensType: string;
  stage: ProductionStage;
  startedAt: string;
  assignedTo: string;
  estimatedCompletion: string;
  notes?: string;
};

export type Sale = {
  id: string;
  patientId: string;
  patientName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  date: string;
  paymentMethod: "Cash" | "Card" | "Transfer" | "HMO";
  status: "Completed" | "Pending" | "Cancelled";
};

export const lensOrders: LensOrder[] = [
  { id: "LO-1001", patientId: "P-001", patientName: "Adesuwa Okoro", orderDate: "2026-07-15", lensType: "Single Vision Anti-Reflective", prescription: "R: -2.00 / L: -1.75", frameType: "Titanium Half-Rim", status: "New", estimatedReady: "2026-07-20" },
  { id: "LO-1002", patientId: "P-005", patientName: "Emeka Obi", orderDate: "2026-07-14", lensType: "Progressive Bi-focal", prescription: "R: +1.50 / L: +1.75", frameType: "Acetate Full-Rim", status: "In Production", estimatedReady: "2026-07-19" },
  { id: "LO-1003", patientId: "P-008", patientName: "Sarah Ahmed", orderDate: "2026-07-13", lensType: "Blue Light Filter", prescription: "R: -0.75 / L: -1.00", frameType: "Metal Wire", status: "In Production", estimatedReady: "2026-07-18" },
  { id: "LO-1004", patientId: "P-012", patientName: "Chidi Okafor", orderDate: "2026-07-11", lensType: "Single Vision Photochromic", prescription: "R: -1.25 / L: -1.50", frameType: "Flexi Nylon", status: "Ready", estimatedReady: "2026-07-16" },
  { id: "LO-1005", patientId: "P-015", patientName: "Blessing Amos", orderDate: "2026-07-10", lensType: "High Index Thin", prescription: "R: -4.00 / L: -3.75", frameType: "Titanium Full-Rim", status: "Delivered", estimatedReady: "2026-07-15" },
  { id: "LO-1006", patientId: "P-018", patientName: "James Eze", orderDate: "2026-07-15", lensType: "Reading Glasses +2.50", prescription: "R: +2.50 / L: +2.50", frameType: "Half-Rim Metal", status: "New", estimatedReady: "2026-07-21" },
  { id: "LO-1007", patientId: "P-020", patientName: "Fatima Yusuf", orderDate: "2026-07-09", lensType: "Polarized Sunglasses", prescription: "R: Plano / L: Plano", frameType: "Aviator Metal", status: "Ready", estimatedReady: "2026-07-14" },
  { id: "LO-1008", patientId: "P-022", patientName: "John Doe", orderDate: "2026-07-08", lensType: "Single Vision Anti-Reflective", prescription: "R: -1.00 / L: -0.75", frameType: "Acetate Full-Rim", status: "Delivered", estimatedReady: "2026-07-13" },
];

export const inventoryItems: InventoryItem[] = [
  { id: "FR-001", name: "Titanium Half-Rim", category: "Frame", brand: "Ray-Ban", quantity: 12, minStock: 5, unitPrice: 45000, location: "Aisle A1" },
  { id: "FR-002", name: "Acetate Full-Rim", category: "Frame", brand: "Oakley", quantity: 8, minStock: 5, unitPrice: 38000, location: "Aisle A2" },
  { id: "FR-003", name: "Metal Wire", category: "Frame", brand: "Gucci", quantity: 3, minStock: 5, unitPrice: 65000, location: "Aisle A1" },
  { id: "FR-004", name: "Flexi Nylon", category: "Frame", brand: "Nike", quantity: 15, minStock: 5, unitPrice: 28000, location: "Aisle A3" },
  { id: "FR-005", name: "Aviator Metal", category: "Frame", brand: "Ray-Ban", quantity: 6, minStock: 5, unitPrice: 55000, location: "Aisle A1" },
  { id: "LN-001", name: "Single Vision AR", category: "Lens", brand: "Zeiss", quantity: 20, minStock: 10, unitPrice: 15000, location: "Bins B1" },
  { id: "LN-002", name: "Progressive Bi-focal", category: "Lens", brand: "Essilor", quantity: 7, minStock: 10, unitPrice: 35000, location: "Bins B2" },
  { id: "LN-003", name: "Blue Light Filter", category: "Lens", brand: "Hoya", quantity: 25, minStock: 10, unitPrice: 12000, location: "Bins B3" },
  { id: "LN-004", name: "Photochromic", category: "Lens", brand: "Transitions", quantity: 4, minStock: 10, unitPrice: 28000, location: "Bins B1" },
  { id: "LN-005", name: "High Index Thin", category: "Lens", brand: "Zeiss", quantity: 9, minStock: 10, unitPrice: 42000, location: "Bins B2" },
  { id: "LN-006", name: "Polarized", category: "Lens", brand: "Maui Jim", quantity: 11, minStock: 10, unitPrice: 22000, location: "Bins B3" },
  { id: "AC-001", name: "Cleaning Spray 50ml", category: "Accessory", brand: "Zeiss", quantity: 30, minStock: 15, unitPrice: 2500, location: "Shelf C1" },
  { id: "AC-002", name: "Microfiber Cloth", category: "Accessory", brand: "Generic", quantity: 45, minStock: 20, unitPrice: 1500, location: "Shelf C1" },
  { id: "AC-003", name: "Hard Case", category: "Accessory", brand: "Generic", quantity: 18, minStock: 10, unitPrice: 5000, location: "Shelf C2" },
  { id: "AC-004", name: "Screwdriver Kit", category: "Accessory", brand: "Generic", quantity: 2, minStock: 5, unitPrice: 3000, location: "Shelf C2" },
];

export const productionItems: ProductionItem[] = [
  { id: "PR-001", orderId: "LO-1002", patientName: "Emeka Obi", lensType: "Progressive Bi-focal", stage: "Production Started", startedAt: "2026-07-14 10:30", assignedTo: "Opt. S. Danladi", estimatedCompletion: "2026-07-19" },
  { id: "PR-002", orderId: "LO-1003", patientName: "Sarah Ahmed", lensType: "Blue Light Filter", stage: "Order Received", startedAt: "2026-07-14 09:15", assignedTo: "Tech. P. Okafor", estimatedCompletion: "2026-07-18" },
  { id: "PR-003", orderId: "LO-1004", patientName: "Chidi Okafor", lensType: "Single Vision Photochromic", stage: "Quality Check", startedAt: "2026-07-12 14:00", assignedTo: "Opt. S. Danladi", estimatedCompletion: "2026-07-16" },
  { id: "PR-004", orderId: "LO-1007", patientName: "Fatima Yusuf", lensType: "Polarized Sunglasses", stage: "Ready for Pickup", startedAt: "2026-07-10 08:00", assignedTo: "Tech. P. Okafor", estimatedCompletion: "2026-07-14" },
  { id: "PR-005", orderId: "LO-1001", patientName: "Adesuwa Okoro", lensType: "Single Vision Anti-Reflective", stage: "Order Received", startedAt: "2026-07-15 11:00", assignedTo: "Opt. S. Danladi", estimatedCompletion: "2026-07-20" },
  { id: "PR-006", orderId: "LO-1006", patientName: "James Eze", lensType: "Reading Glasses +2.50", stage: "Order Received", startedAt: "2026-07-15 11:30", assignedTo: "Tech. P. Okafor", estimatedCompletion: "2026-07-21" },
];

export const salesData: Sale[] = [
  { id: "S-001", patientId: "P-012", patientName: "Chidi Okafor", items: [{ name: "Single Vision Photochromic Lens", qty: 2, price: 28000 }, { name: "Flexi Nylon Frame", qty: 1, price: 28000 }, { name: "Cleaning Spray", qty: 1, price: 2500 }], total: 86500, date: "2026-07-16", paymentMethod: "Card", status: "Completed" },
  { id: "S-002", patientId: "P-015", patientName: "Blessing Amos", items: [{ name: "High Index Thin Lens", qty: 2, price: 42000 }, { name: "Titanium Full-Rim Frame", qty: 1, price: 45000 }], total: 129000, date: "2026-07-15", paymentMethod: "Transfer", status: "Completed" },
  { id: "S-003", patientId: "P-020", patientName: "Fatima Yusuf", items: [{ name: "Polarized Lens", qty: 2, price: 22000 }, { name: "Aviator Metal Frame", qty: 1, price: 55000 }], total: 99000, date: "2026-07-14", paymentMethod: "HMO", status: "Completed" },
  { id: "S-004", patientId: "P-001", patientName: "Adesuwa Okoro", items: [{ name: "Single Vision AR Lens", qty: 2, price: 15000 }, { name: "Titanium Half-Rim Frame", qty: 1, price: 45000 }], total: 75000, date: "2026-07-15", paymentMethod: "Cash", status: "Pending" },
  { id: "S-005", patientId: "P-018", patientName: "James Eze", items: [{ name: "Reading Lens +2.50", qty: 2, price: 12000 }, { name: "Half-Rim Metal Frame", qty: 1, price: 32000 }], total: 56000, date: "2026-07-15", paymentMethod: "Card", status: "Pending" },
];
