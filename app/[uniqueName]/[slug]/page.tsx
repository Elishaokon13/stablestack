"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublicProduct } from "@/lib/hooks/product";
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
} from "lucide-react";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const uniqueName = params.uniqueName as string;
  const slug = params.slug as string;

  const { product, loading, error } = usePublicProduct({
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

  const isExpired = product?.expiresAt
    ? new Date(product.expiresAt) < new Date()
    : false;
  const isActive = product?.status === "active" && !isExpired;

  const handleProceedToPayment = async () => {
    if (!product?.paymentLink) {
      console.error("❌ No payment link available");
      return;
    }

    setProcessingPayment(true);
    console.log("🚀 Initiating payment for:", product.paymentLink);

    try {
      const intent = await createIntent(product.paymentLink);

      if (intent) {
        console.log("✅ Payment intent created successfully:", intent);
        console.log("🔗 Payment link:", intent.paymentLink);

        // Redirect to the payment link (Stripe checkout or custom payment page)
        window.location.href = intent.paymentLink;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-400 mb-4">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Secure Payment
          </h1>
          <p className="text-gray-400">Complete your purchase securely</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Details - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-24 h-24 text-white/10" />
                  </div>
                )}
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

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {product.productName}
                  </h2>
                  <p className="text-gray-400">{product.description}</p>
                </div>

                <Separator className="bg-white/10" />

                {/* Product Meta */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Package className="w-4 h-4" />
                    <span>Product ID: {product.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Listed: {formatDate(product.createdAt)}</span>
                  </div>
                  {product.expiresAt && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {isExpired ? "Expired" : "Expires"}:{" "}
                        {formatDate(product.expiresAt)}
                      </span>
                    </div>
                  )}
                  {product.seller && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>
                        Sold by:{" "}
                        <span className="text-blue-400">
                          @{product.seller.uniqueName}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-1">
                    Secure Payment
                  </h3>
                  <p className="text-xs text-gray-400">
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
            <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Payment Summary
              </h3>

              <div className="space-y-4 mb-6">
                {/* Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-green-400">
                      ${product.amount}
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.payoutToken}
                    </span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Blockchain */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white uppercase font-medium">
                    {product.payoutChain?.replace("-", " ") || "N/A"}
                  </span>
                </div>

                {/* Token */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Token</span>
                  <span className="text-white font-medium">
                    {product.payoutToken || "N/A"}
                  </span>
                </div>

                <Separator className="bg-white/10" />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">${product.amount}</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                size="lg"
                disabled={!isActive || processingPayment || creatingIntent}
                onClick={handleProceedToPayment}
                className={`w-full ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gray-600 cursor-not-allowed"
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
                      ? "Product Expired"
                      : "Product Unavailable"}
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
                <p className="text-xs text-gray-400 text-center mt-4">
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
