/**
 * Wallet Balance Hook
 * Fetches wallet balance
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface BalanceItem {
  convertedBalance: string;
  chain: string;
  asset: string;
}

export interface WalletBalanceData {
  balances: BalanceItem[];
  chain: string;
  userId: string;
  timestamp: string;
}

interface WalletBalanceResponse {
  ok: boolean;
  message: string;
  data: WalletBalanceData;
}

interface UseWalletBalanceOptions {
  chain?: "base" | "base-sepolia";
  autoFetch?: boolean;
}

interface UseWalletBalanceReturn {
  balance: WalletBalanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWalletBalance(
  options: UseWalletBalanceOptions = {}
): UseWalletBalanceReturn {
  const { chain = "base-sepolia", autoFetch = true } = options;
  const { getToken } = useAuth();
  const [balance, setBalance] = useState<WalletBalanceData | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    console.log("💰 Fetching wallet balance for chain:", chain);
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<WalletBalanceResponse>(
        `/protected/wallet/balance?chain=${chain}`,
        token
      );

      console.log("✅ Wallet balance received:", response.data);
      console.log("💵 Balances:", response.data.balances);
      console.log("⛓️ Chain:", response.data.chain);

      setBalance(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("❌ API Error fetching wallet balance:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("❌ Error fetching wallet balance:", err.message);
        setError(err.message);
      } else {
        console.error("❌ Unknown error fetching wallet balance:", err);
        setError("Failed to fetch wallet balance");
      }
    } finally {
      console.log("🏁 Wallet balance fetch complete");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchBalance();
    }
  }, [chain]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
