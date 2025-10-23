/**
 * Payment Link Stats Hook
 * Fetches payment link statistics for authenticated user
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface PaymentLinkStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
}

interface PaymentLinkStatsResponse {
  ok: boolean;
  message: string;
  data: PaymentLinkStats;
}

interface UsePaymentLinkStatsReturn {
  stats: PaymentLinkStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePaymentLinkStats(): UsePaymentLinkStatsReturn {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<PaymentLinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<PaymentLinkStatsResponse>(
        "/protected/payment-link/stats",
        token
      );
      setStats(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error fetching payment link stats:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching payment link stats:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching payment link stats:", err);
        setError("Failed to fetch payment link stats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
