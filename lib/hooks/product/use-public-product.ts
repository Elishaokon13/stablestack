/**
 * Public Product Hook
 * Fetches product by unique name and slug (public endpoint)
 */

import { useState, useEffect } from "react";
import { apiClient, ApiError } from "@/lib/api/client";

export interface PublicProduct {
  id: string;
  userId: string;
  image: string | null;
  productName: string;
  description: string;
  amount: string;
  payoutChain: string;
  payoutToken: string;
  paymentLink: string;
  slug: string;
  linkExpiration: string;
  customDays: number | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    uniqueName: string;
    displayName?: string;
  };
}

interface PublicProductResponse {
  ok: boolean;
  message: string;
  data: {
    product: PublicProduct;
  };
}

interface UsePublicProductOptions {
  uniqueName: string;
  slug: string;
  autoFetch?: boolean;
}

interface UsePublicProductReturn {
  product: PublicProduct | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePublicProduct(
  options: UsePublicProductOptions
): UsePublicProductReturn {
  const { uniqueName, slug, autoFetch = true } = options;
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!uniqueName || !slug) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PublicProductResponse>(
        `/public/p/${uniqueName}/${slug}`
      );

      setProduct(response.data.product);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error fetching public product:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching public product:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching public product:", err);
        setError("Failed to fetch product");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProduct();
    }
  }, [uniqueName, slug]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}
