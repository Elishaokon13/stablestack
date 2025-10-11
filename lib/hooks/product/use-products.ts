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
