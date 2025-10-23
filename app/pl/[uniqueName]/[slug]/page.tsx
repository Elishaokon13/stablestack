"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublicProductLink } from "@/lib/hooks/product/use-public-product-link";
import { usePaymentIntent } from "@/lib/hooks/payment";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Shield,
  CreditCard,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

export default function PaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const uniqueName = params.uniqueName as string;
  const slug = params.slug as string;

  const { productLink, loading, error } = usePublicProductLink({
    uniqueName,
    slug,
  });

  const {
    loading: creatingIntent,
    error: intentError,
    createIntent,
  } = usePaymentIntent();

  const [processingPayment, setProcessingPayment] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = productLink?.expiresAt
    ? new Date(productLink.expiresAt) < new Date()
    : false;
  const isActive = productLink?.status === "active" && !isExpired;

  // Log product link details when loaded
  useEffect(() => {
    if (productLink && !loading) {
      console.log("📄 Payment Link Page Loaded");
      console.log("🆔 Unique Name:", uniqueName);
      console.log("🔖 Slug:", slug);
      console.log("🔗 Product Link Details:", productLink);
      console.log("📅 Expiration Info:", {
        expiresAt: productLink.expiresAt,
        isExpired,
        isActive,
        status: productLink.status,
      });
    }
  }, [productLink, loading]);

  const handleProceedToPayment = async () => {
    console.log("🚀 Proceed to Payment clicked");
    console.log("🔗 Product Link:", productLink);
    console.log("💳 Payment Link URL:", productLink?.paymentLink);

    if (!productLink?.paymentLink) {
      console.error("❌ No payment link available");
      return;
    }

    setProcessingPayment(true);
    console.log("⏳ Creating payment intent...");

    try {
      const intent = await createIntent(productLink.paymentLink);
      console.log("✅ Payment intent created:", intent);

      if (intent) {
        console.log("💳 Client Secret:", intent.clientSecret);
        console.log("🆔 Payment Intent ID:", intent.paymentIntentId);

        // Check if backend returned a Stripe Checkout URL
        if (
          intent.paymentLink &&
          intent.paymentLink.includes("checkout.stripe.com")
        ) {
          console.log("🔀 Redirecting to Stripe Checkout:", intent.paymentLink);
          window.location.href = intent.paymentLink;
        }
        // Otherwise, navigate to custom checkout page with clientSecret
        else if (intent.clientSecret) {
          console.log("🔀 Navigating to custom checkout page");
          const checkoutUrl = `/pl/${uniqueName}/${slug}/checkout?secret=${intent.clientSecret}&intent=${intent.paymentIntentId}`;
          console.log("📍 Checkout URL:", checkoutUrl);
          router.push(checkoutUrl);
        } else {
          console.error("❌ No payment URL or client secret available");
          alert("Payment configuration error. Please contact support.");
        }
      } else {
        console.error("❌ Failed to create payment intent");
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error processing payment:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/40 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (error || !productLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Link Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The payment link you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Secure Payment
          </h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Link Details - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Link Card */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Product Link Image */}
              <div className="relative h-64 bg-muted">
                <div className="w-full h-full flex items-center justify-center">
                  <LinkIcon className="w-24 h-24 text-muted-foreground" />
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isActive ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                      <XCircle className="w-3 h-3 mr-1" />
                      {isExpired ? "Expired" : "Unavailable"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Link Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {productLink.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {productLink.description}
                  </p>
                </div>

                <Separator className="bg-border" />

                {/* Product Link Meta */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LinkIcon className="w-4 h-4" />
                    <span>Payment Link ID: {productLink.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(productLink.createdAt)}</span>
                  </div>
                  {productLink.expiresAt && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {isExpired ? "Expired" : "Expires"}:{" "}
                        {formatDate(productLink.expiresAt)}
                      </span>
                    </div>
                  )}
                  {productLink.seller && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>
                        Created by:{" "}
                        <span className="text-primary">
                          @{productLink.seller.uniqueName}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Purpose: {productLink.purpose}</span>
                  </div>
                  {productLink.allowMultiplePayments && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Multiple payments allowed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-1">
                    Secure Payment
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your payment is processed securely using industry-standard
                    encryption. Funds are held in escrow until delivery is
                    confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Payment Summary
              </h3>

              <div className="space-y-4 mb-6">
                {/* Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                      ${productLink.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {productLink.currency?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Purpose */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="text-foreground uppercase font-medium">
                    {productLink.purpose}
                  </span>
                </div>

                {/* Network */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="text-foreground uppercase font-medium">
                    {productLink.payoutChain?.replace("-", " ") || "N/A"}
                  </span>
                </div>

                {/* Token */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Token</span>
                  <span className="text-foreground font-medium">
                    {productLink.payoutToken || "N/A"}
                  </span>
                </div>

                <Separator className="bg-border" />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${productLink.amount}</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                size="lg"
                disabled={!isActive || processingPayment || creatingIntent}
                onClick={handleProceedToPayment}
                className={`w-full ${
                  isActive
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted cursor-not-allowed"
                }`}
              >
                {processingPayment || creatingIntent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isActive
                      ? "Proceed to Payment"
                      : isExpired
                      ? "Payment Link Expired"
                      : "Payment Link Unavailable"}
                  </>
                )}
              </Button>

              {/* Error Message */}
              {intentError && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 text-center">
                    ❌ {intentError}
                  </p>
                </div>
              )}

              {isActive && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By proceeding, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
