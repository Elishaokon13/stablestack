/**
 * Wallet Withdraw Hook
 * Handles single and batch asset withdrawals
 */

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface SingleWithdrawData {
  chain: "base" | "base-sepolia";
  asset: "USDC" | "ETH";
  amount: string;
  address: string;
  metadata?: Record<string, any>;
  reference?: string;
}

export interface BatchWithdrawAsset {
  chain: "base" | "base-sepolia";
  asset: "USDC" | "ETH";
  address: string;
  amount: string;
  metadata?: Record<string, any>;
  reference?: string;
}

export interface BatchWithdrawData {
  assets: BatchWithdrawAsset[];
}

export interface BatchWithdrawResultData {
  transactionId: string;
  hash: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  totalAmount: string;
  assetCount: number;
  chains: string[];
}

interface BatchWithdrawResponse {
  success: boolean;
  message: string;
  data: BatchWithdrawResultData;
  timestamp: string;
}

export interface WithdrawResultData {
  transactionId: string;
  hash: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: string;
  recipientAddress: string;
  asset: string;
  chain: string;
}

interface SingleWithdrawResponse {
  success: boolean;
  message: string;
  data: WithdrawResultData;
  timestamp: string;
}

interface UseWithdrawReturn {
  loading: boolean;
  error: string | null;
  result: WithdrawResultData | null;
  withdrawSingle: (
    data: SingleWithdrawData
  ) => Promise<WithdrawResultData | null>;
  withdrawBatch: (data: BatchWithdrawData) => Promise<any | null>;
}

export function useWithdraw(): UseWithdrawReturn {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WithdrawResultData | null>(null);

  const withdrawSingle = async (
    data: SingleWithdrawData
  ): Promise<WithdrawResultData | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.post<SingleWithdrawResponse>(
        "/protected/wallet/withdraw/single",
        data,
        token
      );
      setResult(response.data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error withdrawing:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error withdrawing:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error withdrawing:", err);
        setError("Failed to execute withdrawal");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const withdrawBatch = async (
    data: BatchWithdrawData
  ): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const result = await apiClient.post<any>(
        "/protected/wallet/withdraw/batch",
        data,
        token
      );

      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to execute batch withdrawal");
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
    withdrawSingle,
    withdrawBatch,
  };
}
