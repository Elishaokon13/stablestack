import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface PublicProductLink {
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
  seller?: {
    uniqueName: string;
    displayName?: string;
  };
}

interface UsePublicProductLinkParams {
  uniqueName: string;
  slug: string;
}

interface UsePublicProductLinkReturn {
  productLink: PublicProductLink | null;
  loading: boolean;
  error: string | null;
}

export function usePublicProductLink({
  uniqueName,
  slug,
}: UsePublicProductLinkParams): UsePublicProductLinkReturn {
  const [productLink, setProductLink] = useState<PublicProductLink | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductLink = async () => {
      if (!uniqueName || !slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔍 [Public Product Link] Fetching:", {
          uniqueName,
          slug,
          endpoint: `/public/pl/${uniqueName}/${slug}`,
        });

        const response = await fetch(
          `${API_BASE_URL}/public/pl/${uniqueName}/${slug}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(
          "📡 [Public Product Link] Response status:",
          response.status
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Payment link not found");
          }
          if (response.status === 403) {
            throw new Error("Payment link is not publicly accessible");
          }
          throw new Error(`Failed to fetch payment link: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ [Public Product Link] Data received:", data);

        if (data.ok && data.data?.paymentLink) {
          setProductLink(data.data.paymentLink);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("❌ [Public Product Link] Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch payment link"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductLink();
  }, [uniqueName, slug]);

  return {
    productLink,
    loading,
    error,
  };
}
