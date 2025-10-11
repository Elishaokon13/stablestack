/**
 * Product Analytics Hook
 * Fetches payment counts and amounts for a specific product
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

interface PaymentCounts {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

interface PaymentAmounts {
  total: number;
  completed: number;
  pending: number;
}

interface UseProductAnalyticsReturn {
  counts: PaymentCounts | null;
  amounts: PaymentAmounts | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductAnalytics(
  productId: string
): UseProductAnalyticsReturn {
  const { getToken } = useAuth();
  const [counts, setCounts] = useState<PaymentCounts | null>(null);
  const [amounts, setAmounts] = useState<PaymentAmounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const [countsData, amountsData] = await Promise.all([
        apiClient.get<PaymentCounts>(
          `/protected/product/${productId}/payment-counts`,
          token
        ),
        apiClient.get<PaymentAmounts>(
          `/protected/product/${productId}/payment-amounts`,
          token
        ),
      ]);

      setCounts(countsData);
      setAmounts(amountsData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch product analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [productId]);

  return {
    counts,
    amounts,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
