import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listProducts, createProduct, updateProduct, deleteProduct,
  type Product, type CreateProductData, type UpdateProductData,
} from "@/services/products.service";

const PRODUCT_KEYS = {
  all: (clinicId: string) => ["products", clinicId] as const,
};

export function useProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: PRODUCT_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => listProducts(user?.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateProductData, "clinicId">) =>
      createProduct({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all(user.clinicId) });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductData }) =>
      updateProduct(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all(user.clinicId) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all(user.clinicId) });
    },
  });
}
