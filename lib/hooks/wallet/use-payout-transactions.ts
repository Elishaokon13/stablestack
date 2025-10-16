/**
 * Payout Transactions Hook
 * Fetches wallet payout transactions for a specific chain
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

// API Response structure
interface PayoutTransactionAPI {
  transactionId: string;
  hash: string;
  asset: string;
  chain: string;
  reference: string;
  amount?: string;
  status?: string;
  createdAt?: string;
  timestamp?: string;
}

// Component structure
export interface PayoutTransaction {
  id: string;
  amount: string;
  token: string;
  status: string;
  txHash?: string;
  timestamp: string;
}

interface PayoutTransactionsDataAPI {
  transactions: PayoutTransactionAPI[];
  count: number;
  chain: string;
}

interface PayoutTransactionsResponse {
  ok: boolean;
  message: string;
  data: PayoutTransactionsDataAPI;
}

// Helper function to map API response to component structure
function mapTransactionAPIToComponent(tx: any): PayoutTransaction {
  // Log all available fields for debugging
  console.log("📊 Transaction fields available:", Object.keys(tx));
  
  return {
    id: tx.transactionId || tx.id || "unknown",
    amount: tx.amount || tx.value || "0", // Try multiple field names
    token: tx.asset || tx.token || tx.currency || "USDC",
    status: tx.status || "completed", // Default to completed if not provided
    txHash: tx.hash || tx.txHash || tx.transactionHash,
    timestamp: tx.timestamp || tx.createdAt || tx.created_at || new Date().toISOString(),
  };
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
      return;
    }

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
      
      console.log("📊 Payout Transactions Response:", response);
      console.log("📊 Transactions data (raw):", response.data.transactions);
      
      // Map API response to component structure
      const mappedTransactions = (response.data.transactions || []).map(
        mapTransactionAPIToComponent
      );
      
      console.log("📊 Transactions data (mapped):", mappedTransactions);
      
      setTransactions(mappedTransactions);
      setCount(response.data.count || 0);
      setChainState(response.data.chain);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(
          "❌ API Error fetching payout transactions:",
          err.message
        );
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching payout transactions:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching payout transactions:", err);
        setError("Failed to fetch payout transactions");
      }
    } finally {
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
