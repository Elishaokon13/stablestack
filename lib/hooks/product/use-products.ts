/**
 * Products Hook
 * Handles fetching products with pagination
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiError } from "@/lib/api/client";

export interface Product {
  id: string;
  userId: string;
  image: string | null;
  productName: string;
  description: string;
  amount: string;
  payoutChain: string;
  payoutToken: string;
  paymentLink: string;
  slug: string;
  linkExpiration: string;
  customDays: number | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductsResponse {
  ok: boolean;
  message: string;
  data: Product[];
  pagination: Pagination;
}

interface UseProductsOptions {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "expired";
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchPage: (page: number) => void;
}

export function useProducts(
  options: UseProductsOptions = {}
): UseProductsReturn {
  const { page = 1, limit = 15, status, autoFetch = true } = options;
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (pageNum: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Build query params
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await apiClient.get<ProductsResponse>(
        `/protected/product?${params.toString()}`,
        token
      );
      setProducts(response.data);
      setPagination(response.pagination);
      setCurrentPage(pageNum);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error fetching products:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error fetching products:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error fetching products:", err);
        setError("Failed to fetch products");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, []);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: () => fetchProducts(currentPage),
    fetchPage: fetchProducts,
  };
}

// Define PaymentLink object (as per response)
export interface PaymentLink {
  id: string;
  name: string;
  description: string;
  amount: string;
  currency: string;
  purpose: string;
  payoutChain: string;
  payoutToken: string;
  slug: string;
  paymentLink: string;
  expiresIn?: number;
  expiresAt?: string;
  allowMultiplePayments: boolean;
  usageCount: number;
  status: string;
  createdAt: string;
}

// For paginated result if needed in future
interface PaymentLinksResponse {
  data: PaymentLink[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  ok?: boolean;
}

// Simple API client for fetch
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchPaymentLinks(
  token: string | null,
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
): Promise<PaymentLinksResponse> {
  let url = `${API_BASE_URL}/protected/payment-link?page=${page}&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    let errData: any = {};
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errData = await res.json().catch(() => ({}));
    } else {
      errData = { message: await res.text() };
    }
    throw new ApiError(
      errData.message || res.statusText,
      res.status,
      errData
    );
  }
  // Backwards compatible - single or array
  const data = await res.json();
  // Support for both array of payment links or single one in "data.paymentLinks" or "data.paymentLink"
  let paymentLinks = [];
  if (Array.isArray(data.data?.paymentLinks)) {
    paymentLinks = data.data.paymentLinks;
  } else if (data.data?.paymentLink) {
    paymentLinks = [data.data.paymentLink];
  } else if (Array.isArray(data.data)) {
    paymentLinks = data.data;
  }
  return {
    data: paymentLinks,
    pagination: data.pagination,
    message: data.message,
    ok: data.ok,
  };
}

export function usePaymentLinks(opts?: { page?: number; limit?: number; autoFetch?: boolean }) {
  const { getToken } = useAuth();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [pagination, setPagination] = useState<PaymentLinksResponse["pagination"]>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(opts?.page || 1);
  const limit = opts?.limit || 20;
  const autoFetch = opts?.autoFetch !== false;

  const fetchLinks = async (pageNum: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      const result = await fetchPaymentLinks(token, { page: pageNum, limit });
      setPaymentLinks(result.data);
      setPagination(result.pagination);
      setCurrentPage(pageNum);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch payment links");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    paymentLinks,
    pagination,
    loading,
    error,
    refetch: () => fetchLinks(currentPage),
    fetchPage: fetchLinks,
  };
}
