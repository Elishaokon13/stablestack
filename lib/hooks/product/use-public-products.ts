/**
 * Public Products Hook
 * Fetches all active products for a user by unique name (public endpoint)
 */

import { useState, useEffect } from "react";
import { apiClient, ApiError } from "@/lib/api/client";

export interface PublicProductItem {
  id: string;
  image?: string | null;
  productName: string;
  description: string;
  amount: string;
  payoutChain: string;
  payoutToken: string;
  slug: string;
  paymentLink: string;
  status: string;
  createdAt: string;
}

interface PublicProductsResponse {
  ok: boolean;
  message: string;
  data: {
    uniqueName: string;
    products: PublicProductItem[];
    total: number;
  };
}

interface UsePublicProductsOptions {
  uniqueName: string;
  autoFetch?: boolean;
}

interface UsePublicProductsReturn {
  uniqueName: string | null;
  products: PublicProductItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePublicProducts(
  options: UsePublicProductsOptions
): UsePublicProductsReturn {
  const { uniqueName, autoFetch = true } = options;
  const [stateUniqueName, setStateUniqueName] = useState<string | null>(null);
  const [products, setProducts] = useState<PublicProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!uniqueName) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PublicProductsResponse>(
        `/public/p/${uniqueName}`
      );
      setStateUniqueName(response.data.uniqueName);
      setProducts(response.data.products);
      setTotal(response.data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error fetching public products:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching public products:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching public products:", err);
        setError("Failed to fetch products");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [uniqueName]);

  return {
    uniqueName: stateUniqueName,
    products,
    total,
    loading,
    error,
    refetch: fetchProducts,
  };
}
