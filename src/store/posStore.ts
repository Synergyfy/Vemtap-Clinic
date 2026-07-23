import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'hmo' | 'split';
export type TransactionStatus = 'completed' | 'refunded' | 'voided';
export type ShiftStatus = 'open' | 'closed';

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  stock?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface PaymentEntry {
  method: Exclude<PaymentMethod, 'split'>;
  amount: number;
  reference?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  items: CartItem[];
  payments: PaymentEntry[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  status: TransactionStatus;
  cashierName: string;
  patientName?: string;
  timestamp: string;
  note?: string;
}

export interface PosShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedCash?: number;
  actualCash?: number;
  discrepancy?: number;
  transactionIds: string[];
  status: ShiftStatus;
}

const initialProducts: PosProduct[] = [
  // Consultations
  { id: 'p-001', name: 'General Consultation', category: 'Consultation', unitPrice: 5000 },
  { id: 'p-002', name: 'Specialist Consultation', category: 'Consultation', unitPrice: 10000 },
  { id: 'p-003', name: 'Follow-up Visit', category: 'Consultation', unitPrice: 3000 },
  { id: 'p-004', name: 'Emergency Consultation', category: 'Consultation', unitPrice: 15000 },
  // Eye Tests
  { id: 'p-005', name: 'Comprehensive Eye Exam', category: 'Eye Test', unitPrice: 8000 },
  { id: 'p-006', name: 'Visual Acuity Test', category: 'Eye Test', unitPrice: 3000 },
  { id: 'p-007', name: 'Refraction Test', category: 'Eye Test', unitPrice: 5000 },
  { id: 'p-008', name: 'Glaucoma Screening', category: 'Eye Test', unitPrice: 7000 },
  // Optical
  { id: 'p-009', name: 'Single Vision Lenses', category: 'Optical', unitPrice: 15000 },
  { id: 'p-010', name: 'Bifocal Lenses', category: 'Optical', unitPrice: 25000 },
  { id: 'p-011', name: 'Progressive Lenses', category: 'Optical', unitPrice: 45000 },
  { id: 'p-012', name: 'Anti-Reflective Coating', category: 'Optical', unitPrice: 8000 },
  { id: 'p-013', name: 'Blue Light Filter', category: 'Optical', unitPrice: 5000 },
  { id: 'p-014', name: 'Standard Frame', category: 'Optical', unitPrice: 20000 },
  { id: 'p-015', name: 'Designer Frame', category: 'Optical', unitPrice: 50000 },
  { id: 'p-016', name: 'Contact Lenses (pair)', category: 'Optical', unitPrice: 12000 },
  // Pharmacy
  { id: 'p-017', name: 'Artificial Tears', category: 'Pharmacy', unitPrice: 2500 },
  { id: 'p-018', name: 'Antibiotic Eye Drops', category: 'Pharmacy', unitPrice: 3500 },
  { id: 'p-019', name: 'Anti-Allergy Drops', category: 'Pharmacy', unitPrice: 4000 },
  { id: 'p-020', name: 'Eye Ointment', category: 'Pharmacy', unitPrice: 3000 },
  // Procedures
  { id: 'p-021', name: 'Cataract Surgery (per eye)', category: 'Procedure', unitPrice: 150000 },
  { id: 'p-022', name: 'LASIK (per eye)', category: 'Procedure', unitPrice: 120000 },
  { id: 'p-023', name: 'Pterygium Excision', category: 'Procedure', unitPrice: 80000 },
  { id: 'p-024', name: 'Eye Injection', category: 'Procedure', unitPrice: 25000 },
  // Others
  { id: 'p-025', name: 'Eye Patch', category: 'Other', unitPrice: 1500 },
  { id: 'p-026', name: 'Sunglasses', category: 'Other', unitPrice: 10000 },
  { id: 'p-027', name: 'Cleaning Kit', category: 'Other', unitPrice: 3000 },
];

const deriveCategories = (products: PosProduct[]) => {
  const cats = [...new Set(products.map((p) => p.category))];
  return ['All', ...cats.sort()];
};

interface PosState {
  // Cart
  cartItems: CartItem[];
  discount: number;
  patientName: string;
  note: string;

  // Products
  products: PosProduct[];
  categories: string[];

  // Shift
  activeShift: PosShift | null;
  shiftHistory: PosShift[];

  // Transactions
  transactions: Transaction[];

  // Cart actions
  addToCart: (product: PosProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number) => void;
  setPatientName: (name: string) => void;
  setNote: (note: string) => void;

  // Product CRUD
  addProduct: (product: Omit<PosProduct, 'id'>) => PosProduct;
  updateProduct: (id: string, updates: Partial<Omit<PosProduct, 'id'>>) => void;
  deleteProduct: (id: string) => void;

  // Shift actions
  openShift: (cashierName: string, openingBalance: number) => void;
  closeShift: (actualCash: number) => void;

  // Transaction actions
  completeTransaction: (payments: PaymentEntry[]) => Transaction;
  voidTransaction: (transactionId: string) => void;

  resetPos: () => void;
}

const initialState = {
  cartItems: [] as CartItem[],
  discount: 0,
  patientName: '',
  note: '',
  products: initialProducts,
  categories: deriveCategories(initialProducts),
  activeShift: null as PosShift | null,
  shiftHistory: [] as PosShift[],
  transactions: [] as Transaction[],
};

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addToCart: (product) => set((state) => {
        const existing = state.cartItems.find((i) => i.productId === product.id);
        if (existing) {
          return {
            cartItems: state.cartItems.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
                : i
            ),
          };
        }
        return {
          cartItems: [
            ...state.cartItems,
            {
              productId: product.id,
              name: product.name,
              quantity: 1,
              unitPrice: product.unitPrice,
              total: product.unitPrice,
              category: product.category,
            },
          ],
        };
      }),

      removeFromCart: (productId) => set((state) => ({
        cartItems: state.cartItems.filter((i) => i.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        cartItems: quantity <= 0
          ? state.cartItems.filter((i) => i.productId !== productId)
          : state.cartItems.map((i) =>
              i.productId === productId
                ? { ...i, quantity, total: quantity * i.unitPrice }
                : i
            ),
      })),

      clearCart: () => set({ cartItems: [], discount: 0, patientName: '', note: '' }),

      addProduct: (data) => {
        const newProduct: PosProduct = { id: `p-${Date.now()}`, ...data };
        set((state) => ({
          products: [...state.products, newProduct],
          categories: deriveCategories([...state.products, newProduct]),
        }));
        return newProduct;
      },

      updateProduct: (id, updates) => set((state) => {
        const updated = state.products.map((p) => p.id === id ? { ...p, ...updates } : p);
        return { products: updated, categories: deriveCategories(updated) };
      }),

      deleteProduct: (id) => set((state) => {
        const filtered = state.products.filter((p) => p.id !== id);
        return { products: filtered, categories: deriveCategories(filtered) };
      }),

      setDiscount: (amount) => set({ discount: Math.max(0, amount) }),

      setPatientName: (name) => set({ patientName: name }),

      setNote: (note) => set({ note }),

      openShift: (cashierName, openingBalance) => set((state) => {
        if (state.activeShift) return {};
        const newShift: PosShift = {
          id: `shift-${Date.now()}`,
          cashierName,
          startTime: new Date().toISOString(),
          openingBalance,
          transactionIds: [],
          status: 'open',
        };
        return { activeShift: newShift };
      }),

      closeShift: (actualCash) => set((state) => {
        if (!state.activeShift) return {};
        const totalCash = state.transactions
          .filter((t) => t.status === 'completed' && state.activeShift!.transactionIds.includes(t.id))
          .reduce((sum, t) => sum + t.payments.filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount, 0), 0);
        const expectedCash = state.activeShift.openingBalance + totalCash;
        const closedShift: PosShift = {
          ...state.activeShift,
          endTime: new Date().toISOString(),
          closingBalance: actualCash,
          expectedCash,
          actualCash,
          discrepancy: actualCash - expectedCash,
          status: 'closed',
        };
        return {
          activeShift: null,
          shiftHistory: [...state.shiftHistory, closedShift],
        };
      }),

      completeTransaction: (payments) => {
        const state = get();
        if (!state.activeShift) throw new Error('No active shift');

        const subtotal = state.cartItems.reduce((sum, i) => sum + i.total, 0);
        const total = Math.max(0, subtotal - state.discount);
        const paid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = Math.max(0, total - paid);

        const receiptNum = `RCP-${String(state.transactions.length + 1).padStart(4, '0')}`;
        const transaction: Transaction = {
          id: `txn-${Date.now()}`,
          receiptNumber: receiptNum,
          items: [...state.cartItems],
          payments,
          subtotal,
          discount: state.discount,
          total,
          paid,
          balance,
          status: 'completed',
          cashierName: state.activeShift.cashierName,
          patientName: state.patientName || undefined,
          timestamp: new Date().toISOString(),
          note: state.note || undefined,
        };

        set({
          transactions: [...state.transactions, transaction],
          activeShift: state.activeShift
            ? { ...state.activeShift, transactionIds: [...state.activeShift.transactionIds, transaction.id] }
            : null,
          cartItems: [],
          discount: 0,
          patientName: '',
          note: '',
        });

        return transaction;
      },

      voidTransaction: (transactionId) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId ? { ...t, status: 'voided' as TransactionStatus } : t
        ),
      })),

      resetPos: () => set(initialState),
    }),
    {
      name: 'vemtap-pos-storage',
    }
  )
);

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Consultation: 'bg-sky-50 text-sky-700 border-sky-200',
    'Eye Test': 'bg-violet-50 text-violet-700 border-violet-200',
    Optical: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pharmacy: 'bg-amber-50 text-amber-700 border-amber-200',
    Procedure: 'bg-rose-50 text-rose-700 border-rose-200',
    Other: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return colors[category] || colors['Other'];
};
