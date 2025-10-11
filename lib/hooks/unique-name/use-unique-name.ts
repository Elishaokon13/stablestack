/**
 * Unique Name Hook
 * Handles fetching and setting user's unique name
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface UniqueNameData {
  uniqueName: string;
  isUpdate: boolean;
  walletsGenerated: boolean;
}

export interface UniqueNameResponse {
  ok: boolean;
  message: string;
  data: UniqueNameData;
}

export interface GetUniqueNameResponse {
  ok: boolean;
  data: {
    uniqueName: string;
    userId: string;
  };
}

interface UseUniqueNameReturn {
  uniqueName: string | null;
  loading: boolean;
  error: string | null;
  walletsGenerated: boolean | null;
  refetch: () => void;
  setUniqueName: (name: string) => Promise<UniqueNameData | null>;
}

export function useUniqueName(): UseUniqueNameReturn {
  const { getToken } = useAuth();
  const [uniqueName, setUniqueNameState] = useState<string | null>(null);
  const [walletsGenerated, setWalletsGenerated] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniqueName = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<GetUniqueNameResponse>(
        "/protected/unique-name",
        token
      );

      setUniqueNameState(response.data.uniqueName);
    } catch (err) {
      if (err instanceof ApiError) {
        // User might not have a unique name yet - this is OK
        if (err.status === 404) {
          setUniqueNameState(null);
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch unique name");
      }
    } finally {
      setLoading(false);
    }
  };

  const setUniqueName = async (
    name: string
  ): Promise<UniqueNameData | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await apiClient.post<UniqueNameResponse>(
        "/protected/unique-name/set",
        { uniqueName: name },
        token
      );
      setUniqueNameState(response.data.uniqueName);
      setWalletsGenerated(response.data.walletsGenerated);

      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to set unique name");
      }
      console.error("Failed to set unique name:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniqueName();
  }, []);

  return {
    uniqueName,
    loading,
    error,
    walletsGenerated,
    refetch: fetchUniqueName,
    setUniqueName,
  };
}
