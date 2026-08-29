import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { opticalInventoryService, lensOrderService, opticalSalesService } from '@/services/optician.service';

export function useOpticalInventory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['optical-items', user?.clinicId],
    queryFn: () => opticalInventoryService.getItems(user!.clinicId!),
    enabled: !!user?.clinicId,
  });
}

export function useLensOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lens-orders', user?.clinicId],
    queryFn: () => lensOrderService.getAll(user!.clinicId!),
    enabled: !!user?.clinicId,
  });
}

export function useLensOrderProduction(orderId: string | null) {
  return useQuery({
    queryKey: ['lens-order-production', orderId],
    queryFn: () => lensOrderService.getProduction(orderId!),
    enabled: !!orderId,
  });
}

export function useUpdateLensOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) =>
      lensOrderService.updateStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lens-orders'] });
    },
  });
}

export function useUpdateProductionStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, stage, notes }: { orderId: string; stage: string; notes?: string }) =>
      lensOrderService.updateProductionStage(orderId, stage, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lens-order-production'] });
      queryClient.invalidateQueries({ queryKey: ['lens-orders'] });
    },
  });
}

export function useOpticalSales() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['optical-sales', user?.clinicId],
    queryFn: () => opticalSalesService.getAll(user!.clinicId!),
    enabled: !!user?.clinicId,
  });
}

export function useAllProductionItems() {
  const { user } = useAuth();
  const { data: orders = [] } = useLensOrders();

  return useQuery({
    queryKey: ['all-production-items', user?.clinicId],
    queryFn: async () => {
      if (orders.length === 0) return [];
      const results = await Promise.all(
        orders.map(async (order) => {
          try {
            const items = await lensOrderService.getProduction(order.id);
            return items.map((item) => ({
              ...item,
              patientName: order.patient
                ? `${order.patient.firstName} ${order.patient.lastName}`
                : "Unknown Patient",
              lensType: order.lensType,
              estimatedCompletion: order.expectedDeliveryDate,
              orderStatus: order.status,
            }));
          } catch {
            return [];
          }
        })
      );
      return results.flat();
    },
    enabled: !!user?.clinicId && orders.length > 0,
  });
}
