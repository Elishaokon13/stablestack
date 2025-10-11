/**
 * Payment Intent Hook
 * Handles payment intent creation, cancellation, and verification
 */

import { useState } from "react";
import { apiClient, ApiError } from "@/lib/api/client";

export interface PaymentIntentData {
  paymentIntentId: string;
  clientSecret: string;
  productId: string;
  amount: number;
  currency: string;
  status: "INITIATED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  paymentLink: string;
}

export interface PaymentIntentResponse {
  ok: boolean;
  message: string;
  data: PaymentIntentData;
}

interface UsePaymentIntentReturn {
  loading: boolean;
  error: string | null;
  paymentIntent: PaymentIntentData | null;
  createIntent: (paymentLink: string) => Promise<PaymentIntentData | null>;
  cancelIntent: (
    clientSecret: string,
    cancellationReason?: string
  ) => Promise<boolean>;
  verifyMicrodeposits: (
    clientSecret: string,
    amounts: number[]
  ) => Promise<boolean>;
  syncIntent: (intentId: string) => Promise<PaymentIntentData | null>;
}

export function usePaymentIntent(): UsePaymentIntentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(
    null
  );

  const createIntent = async (
    paymentLink: string
  ): Promise<PaymentIntentData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        "/public/payment/intent",
        { paymentLink }
      );
      setPaymentIntent(response.data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create payment intent");
      }
      console.error("Failed to create payment intent:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelIntent = async (
    clientSecret: string,
    cancellationReason?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        ok: boolean;
        message: string;
        data: {
          success: boolean;
        };
        requestId: string;
      }>("/public/payment/intent/cancel", {
        clientSecret,
        cancellationReason,
      });
      return response.data.success;
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error cancelling intent:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error cancelling intent:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error cancelling intent:", err);
        setError("Failed to cancel payment intent");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyMicrodeposits = async (
    clientSecret: string,
    amounts: number[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        ok: boolean;
        message: string;
        data: {
          success: boolean;
          status: string;
        };
        requestId: string;
      }>("/public/payment/intent/verify-microdeposits", {
        clientSecret,
        amounts,
      });
      return response.data.success;
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("API Error verifying microdeposits:", err.message);
        setError(err.message);
      } else if (err instanceof Error) {
        console.error("Error verifying microdeposits:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error verifying microdeposits:", err);
        setError("Failed to verify microdeposits");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncIntent = async (
    intentId: string
  ): Promise<PaymentIntentData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        "/public/payment/intent/sync",
        { intentId }
      );

      setPaymentIntent(response.data);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sync payment intent");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentIntent,
    createIntent,
    cancelIntent,
    verifyMicrodeposits,
    syncIntent,
  };
}
