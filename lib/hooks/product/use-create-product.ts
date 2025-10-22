import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ApiError } from "@/lib/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface CreatePaymentLinkData {
  type: "product";
  name: string;
  description: string;
  amount: string;
  currency: string;
  purpose: string;
  expiresIn: string;
  allowMultiplePayments: boolean;
  payoutChain: string;
  payoutToken: string;
  slug: string;
}

interface CreateProductData {
  image?: File;
  productName: string;
  description: string;
  amount: string;
  payoutChain: "base" | "base-sepolia";
  payoutToken: "USDC";
  slug: string;
  linkExpiration: "never" | "7_days" | "30_days" | "custom_days";
  customDays?: number;
}

interface PaymentLink {
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

export interface Product {
  id: string;
  productName: string;
  description: string;
  amount: string;
  payoutChain: string;
  payoutToken: string;
  slug: string;
  paymentLink: string;
  linkExpiration: string;
  customDays?: number;
  expiresAt?: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

interface CreateProductResponse {
  ok: boolean;
  message: string;
  data: {
    product: Product;
  };
}

interface CreatePaymentLinkResponse {
  ok: boolean;
  message: string;
  data: {
    paymentLink: PaymentLink;
    product: Product;
  };
}

interface UseCreateProductReturn {
  loading: boolean;
  error: string | null;
  createProduct: (data: CreateProductData) => Promise<Product | null>;
}
interface UseCreatePaymentLinkReturn {
  loading: boolean;
  error: string | null;
  createPaymentLink: (
    data: CreatePaymentLinkData
  ) => Promise<PaymentLink | null>;
}

export function useCreateProduct(): UseCreateProductReturn {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (
    data: CreateProductData
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      console.log("🔑 [Create Product] Clerk Token:", token);
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      if (data.image) {
        formData.append("image", data.image);
      }

      formData.append("productName", data.productName);
      formData.append("description", data.description);
      formData.append("amount", data.amount);
      formData.append("payoutChain", data.payoutChain);
      formData.append("payoutToken", data.payoutToken);
      formData.append("slug", data.slug);
      formData.append("linkExpiration", data.linkExpiration);

      if (data.linkExpiration === "custom_days" && data.customDays) {
        formData.append("customDays", data.customDays.toString());
      }

      // Make request with multipart/form-data
      const response = await fetch(`${API_BASE_URL}/protected/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData,
      });
      if (!response.ok) {
        // Try to get error details
        const contentType = response.headers.get("content-type");
        let errorData: any = {};

        if (contentType?.includes("application/json")) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const textError = await response.text().catch(() => "");
          errorData = { message: textError };
        }

        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          fullResponse: JSON.stringify(errorData, null, 2),
        });

        // Extract error message from various possible formats
        const errorMsg =
          errorData.message ||
          errorData.error ||
          errorData.details ||
          (errorData.errors && JSON.stringify(errorData.errors)) ||
          `Server Error (${response.status}): ${response.statusText}`;

        throw new ApiError(errorMsg, response.status, errorData);
      }

      const result: CreateProductResponse = await response.json();
      return result.data.product;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create product");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProduct,
  };
}

export function useCreatePaymentLink(): UseCreatePaymentLinkReturn {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentLink = async (
    data: CreatePaymentLinkData
  ): Promise<PaymentLink | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      console.log("🔑 [Create Product] Clerk Token:", token);
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/protected/payment-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        // Try to get error details
        const contentType = response.headers.get("content-type");
        let errorData: any = {};

        if (contentType?.includes("application/json")) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const textError = await response.text().catch(() => "");
          errorData = { message: textError };
        }

        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          fullResponse: JSON.stringify(errorData, null, 2),
        });

        // Extract error message from various possible formats
        const errorMsg =
          errorData.message ||
          errorData.error ||
          errorData.details ||
          (errorData.errors && JSON.stringify(errorData.errors)) ||
          `Server Error (${response.status}): ${response.statusText}`;

        throw new ApiError(errorMsg, response.status, errorData);
      }

      const result: CreatePaymentLinkResponse = await response.json();
      return result.data.paymentLink;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create payment link");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPaymentLink,
  };
}
