/**
 * Product Stats Hook
 * Fetches product statistics for authenticated user
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface ProductStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
}

interface ProductStatsResponse {
  ok: boolean;
  message: string;
  data: ProductStats;
}

interface UseProductStatsReturn {
  stats: ProductStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductStats(): UseProductStatsReturn {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    console.log("📊 Fetching product stats...");
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<ProductStatsResponse>(
        "/protected/product/stats",
        token
      );

      console.log("✅ Product stats received:", response.data);
      console.log("📈 Total products:", response.data.total);
      console.log("✅ Active:", response.data.active);
      console.log("⏰ Expired:", response.data.expired);
      console.log("❌ Cancelled:", response.data.cancelled);

      setStats(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("❌ API Error fetching product stats:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("❌ Error fetching product stats:", err.message);
        setError(err.message);
      } else {
        console.error("❌ Unknown error fetching product stats:", err);
        setError("Failed to fetch product stats");
      }
    } finally {
      console.log("🏁 Product stats fetch complete");
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
