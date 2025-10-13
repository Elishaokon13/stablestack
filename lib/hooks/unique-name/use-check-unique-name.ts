/**
 * Check Unique Name Hook
 * Checks if a unique name is available
 */

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface CheckUniqueNameData {
  uniqueName: string;
  available: boolean;
  reason?: string;
}

interface CheckUniqueNameResponse {
  ok: boolean;
  message: string;
  data: CheckUniqueNameData;
}

interface UseCheckUniqueNameReturn {
  loading: boolean;
  error: string | null;
  result: CheckUniqueNameData | null;
  checkAvailability: (name: string) => Promise<CheckUniqueNameData | null>;
}

export function useCheckUniqueName(): UseCheckUniqueNameReturn {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckUniqueNameData | null>(null);

  const checkAvailability = async (
    name: string
  ): Promise<CheckUniqueNameData | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<CheckUniqueNameResponse>(
        `/protected/unique-name/check/${name}`,
        token
      );

      console.log(
        response.data.available
          ? "✅ Unique name is available!"
          : `❌ ${response.data.reason}`
      );

      setResult(response.data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error checking unique name:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error checking unique name:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error checking unique name:", err);
        setError("Failed to check unique name");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    checkAvailability,
  };
}
