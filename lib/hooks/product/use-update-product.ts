/**
 * Update Product Hook
 * Handles product updates
 */

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

interface UpdateProductData {
  name?: string;
  description?: string;
  priceUSD?: number;
  imageUrl?: string;
  category?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  priceUSD: number;
  imageUrl?: string;
  paymentLink: string;
  updatedAt: string;
}

interface UseUpdateProductReturn {
  loading: boolean;
  error: string | null;
  updateProduct: (
    productId: string,
    data: UpdateProductData
  ) => Promise<Product | null>;
}

export function useUpdateProduct(): UseUpdateProductReturn {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = async (
    productId: string,
    data: UpdateProductData
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const result = await apiClient.put<{ product: Product }>(
        `/protected/product/${productId}`,
        data,
        token
      );

      return result.product;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update product");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateProduct,
  };
}
