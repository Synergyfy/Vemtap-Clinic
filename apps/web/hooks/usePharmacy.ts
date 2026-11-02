'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pharmacyService,
  Drug,
  Supplier,
  PurchaseOrder,
  Prescription,
  DispenseDrugDto,
  CreateDrugInput,
  UpdateDrugInput,
  CreateSupplierInput,
} from '@/services/pharmacy.service';

const PHARMACY_KEY = 'pharmacy';

// ── Drugs ──
export function useDrugs(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'drugs', clinicId],
    queryFn: () => pharmacyService.getDrugs(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function useLowStockDrugs(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'low-stock', clinicId],
    queryFn: () => pharmacyService.getLowStockDrugs(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function useCreateDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDrugInput) => pharmacyService.createDrug(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'drugs'] });
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'low-stock'] });
    },
  });
}

export function useUpdateDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ drugId, dto }: { drugId: string; dto: UpdateDrugInput }) =>
      pharmacyService.updateDrug(drugId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'drugs'] });
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'low-stock'] });
    },
  });
}

export function useDeleteDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (drugId: string) => pharmacyService.deleteDrug(drugId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'drugs'] });
      qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'low-stock'] });
    },
  });
}

export function useRestockDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ drugId, quantity }: { drugId: string; quantity: number }) =>
      pharmacyService.restockDrug(drugId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'drugs'] }),
  });
}

export function useDispenseDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: DispenseDrugDto) => pharmacyService.dispenseDrug(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'drugs'] }),
  });
}

// ── Suppliers ──
export function useSuppliers(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'suppliers', clinicId],
    queryFn: () => pharmacyService.getSuppliers(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupplierInput) => pharmacyService.createSupplier(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'suppliers'] }),
  });
}

// ── Purchase Orders ──
export function usePurchaseOrders(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'purchase-orders', clinicId],
    queryFn: () => pharmacyService.getPurchaseOrders(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pharmacyService.createPurchaseOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'purchase-orders'] }),
  });
}

export function useDeliverPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => pharmacyService.deliverPurchaseOrder(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PHARMACY_KEY, 'purchase-orders'] }),
  });
}

// ── Prescriptions (via patients) ──
export function usePharmacyPatients(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'patients', clinicId],
    queryFn: () => pharmacyService.getPatients(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
  });
}

export function useAllPrescriptions(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'all-prescriptions', clinicId],
    queryFn: () => pharmacyService.getAllPrescriptions(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
}

export function usePrescriptionsByPatient(patientId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_KEY, 'prescriptions', patientId],
    queryFn: () => pharmacyService.getPrescriptionsByPatient(patientId!),
    enabled: !!patientId,
    staleTime: 30_000,
  });
}

export type { Drug, Supplier, PurchaseOrder, Prescription, DispenseDrugDto, CreateSupplierInput };
