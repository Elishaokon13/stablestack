/**
 * Payment Transactions Hook
 * Fetches payment intent transactions with pagination
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface Transaction {
  id: string;
  paymentIntentId: string | null;
  productId: string | null;
  slug: string | null;
  amount: string | null;
  currency: string | null;
  status: "INITIATED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  customerName: string | null;
  customerEmail: string | null;
  paymentMethodTypes: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TransactionsResponse {
  ok: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: Pagination;
  };
}

interface UseTransactionsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchPage: (page: number) => void;
}

export function useTransactions(
  options: UseTransactionsOptions = {}
): UseTransactionsReturn {
  const { page = 1, limit = 10, autoFetch = true } = options;
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (pageNum: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await apiClient.get<TransactionsResponse>(
        `/protected/payment/transactions?page=${pageNum}&limit=${limit}`,
        token
      );

      console.log("📊 Transactions API Response:", response);
      console.log("📊 Transactions data:", response.data.transactions);
      
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination);
      setCurrentPage(pageNum);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error fetching transactions:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching transactions:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching transactions:", err);
        setError("Failed to fetch transactions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, []);

  return {
    transactions,
    pagination,
    loading,
    error,
    refetch: () => fetchTransactions(currentPage),
    fetchPage: fetchTransactions,
  };
}
