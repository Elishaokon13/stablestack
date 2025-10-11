/**
 * Payment Earnings Hook
 * Fetches payment intent earnings by status
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface EarningsStatus {
  amount: string;
  count: number;
}

export interface EarningsData {
  initiated: EarningsStatus;
  processing: EarningsStatus;
  succeeded: EarningsStatus;
  failed: EarningsStatus;
  cancelled: EarningsStatus;
  total: EarningsStatus;
}

interface EarningsResponse {
  ok: boolean;
  message: string;
  data: EarningsData;
}

interface UseEarningsReturn {
  earnings: EarningsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEarnings(): UseEarningsReturn {
  const { getToken } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    console.log("💰 Fetching earnings...");
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<EarningsResponse>(
        "/protected/payment/earnings",
        token
      );

      console.log("✅ Earnings received:", response.data);
      console.log("💵 Succeeded:", response.data.succeeded);
      console.log("📊 Total:", response.data.total);
      console.log("⏳ Processing:", response.data.processing);

      setEarnings(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("❌ API Error fetching earnings:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("❌ Error fetching earnings:", err.message);
        setError(err.message);
      } else {
        console.error("❌ Unknown error fetching earnings:", err);
        setError("Failed to fetch earnings");
      }
    } finally {
      console.log("🏁 Earnings fetch complete");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return {
    earnings,
    loading,
    error,
    refetch: fetchEarnings,
  };
}
