/**
 * Payout Transactions Hook
 * Fetches wallet payout transactions for a specific chain
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface PayoutTransaction {
  id: string;
  amount: string;
  token: string;
  status: string;
  txHash?: string;
  timestamp: string;
}

interface PayoutTransactionsData {
  transactions: PayoutTransaction[];
  count: number;
  chain: string;
}

interface PayoutTransactionsResponse {
  ok: boolean;
  message: string;
  data: PayoutTransactionsData;
}

interface UsePayoutTransactionsReturn {
  transactions: PayoutTransaction[];
  count: number;
  chain: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePayoutTransactions(
  chain: string
): UsePayoutTransactionsReturn {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [count, setCount] = useState(0);
  const [chainState, setChainState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!chain) {
      console.warn("⚠️ No chain provided");
      return;
    }

    console.log("📜 Fetching payout transactions for chain:", chain);
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<PayoutTransactionsResponse>(
        `/protected/wallet/payouttransactions/${chain}`,
        token
      );

      console.log("✅ Payout transactions received:", response.data);
      console.log("📊 Transaction count:", response.data.count);
      console.log("⛓️ Chain:", response.data.chain);

      setTransactions(response.data.transactions);
      setCount(response.data.count);
      setChainState(response.data.chain);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(
          "❌ API Error fetching payout transactions:",
          err.message
        );
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("❌ Error fetching payout transactions:", err.message);
        setError(err.message);
      } else {
        console.error("❌ Unknown error fetching payout transactions:", err);
        setError("Failed to fetch payout transactions");
      }
    } finally {
      console.log("🏁 Payout transactions fetch complete");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [chain]);

  return {
    transactions,
    count,
    chain: chainState,
    loading,
    error,
    refetch: fetchTransactions,
  };
}
