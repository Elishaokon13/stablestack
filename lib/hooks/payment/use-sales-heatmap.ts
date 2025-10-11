/**
 * Sales Heatmap Hook
 * Fetches sales activity heatmap for the last 365 days
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface DayData {
  date: string;
  dayOfWeek: number;
  dayName: string;
  amount: string;
  count: number;
}

export interface WeekData {
  weekStartDate: string;
  days: DayData[];
}

export interface SalesHeatmapData {
  weeks: WeekData[];
  summary: {
    totalSales: string;
    avgDailySales: string;
    bestDay: DayData;
  };
  metadata: {
    startDate: string;
    endDate: string;
    totalDays: number;
    totalWeeks: number;
  };
}

export interface SalesHeatmapResponse {
  ok: boolean;
  message: string;
  data: SalesHeatmapData;
}

interface UseSalesHeatmapReturn {
  heatmapData: SalesHeatmapData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSalesHeatmap(): UseSalesHeatmapReturn {
  const { getToken } = useAuth();
  const [heatmapData, setHeatmapData] = useState<SalesHeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeatmap = async () => {
    console.log("🔄 Fetching heatmap data...");
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<SalesHeatmapResponse>(
        "/protected/payment/sales-heatmap",
        token
      );

      console.log("📊 Heatmap API Response:", response);
      console.log("📊 Heatmap Data:", response.data);
      console.log("📊 Total Weeks:", response.data.weeks?.length);
      console.log("📊 Summary:", response.data.summary);
      console.log("📊 Metadata:", response.data.metadata);

      // Log first week as sample
      if (response.data.weeks && response.data.weeks.length > 0) {
        console.log("📊 First Week Sample:", response.data.weeks[0]);
        console.log("📊 First Day Sample:", response.data.weeks[0].days[0]);
      }

      setHeatmapData(response.data);
      console.log("✅ Heatmap data successfully loaded!");
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("❌ API Error fetching heatmap:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("❌ Error fetching heatmap:", err.message);
        setError(err.message);
      } else {
        console.error("❌ Unknown error fetching heatmap:", err);
        setError("Failed to fetch heatmap data");
      }
    } finally {
      console.log("🏁 Heatmap fetch complete. Loading:", false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  return {
    heatmapData,
    loading,
    error,
    refetch: fetchHeatmap,
  };
}
