"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripeClient } from "@/lib/stripe";
import { usePublicProduct } from "@/lib/hooks/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CreditCard,
  Shield,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

function CheckoutForm({ clientSecret, product }: { clientSecret: string; product: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("💳 Processing payment...");

    if (!stripe || !elements) {
      console.error("❌ Stripe not loaded");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      console.log("✅ Elements submitted, confirming payment...");

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          receipt_email: email,
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("✅ Payment succeeded!");
        router.push(`/payment/success?payment_intent=${paymentIntent.id}`);
      } else if (paymentIntent?.status === "requires_action") {
        console.log("⚠️ Additional authentication required");
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      console.error("❌ Payment error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/90 font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20"
        />
        <p className="text-xs text-white/50">Receipt will be sent to this email</p>
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        <Label className="text-white/90 font-medium">Payment Information</Label>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
          <PaymentElement />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Shield className="h-3.5 w-3.5" />
          <span>Secured by Stripe</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Lock className="h-3.5 w-3.5" />
          <span>SSL Encrypted</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isProcessing}
        className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${product?.amount || "0.00"}
          </>
        )}
      </Button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="text-xs text-green-400 font-medium">PCI Compliant</span>
        </div>
        <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <span className="text-xs text-blue-400 font-medium">256-bit SSL</span>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const uniqueName = params.uniqueName as string;
  const slug = params.slug as string;
  const clientSecret = searchParams.get("secret");
  const intentId = searchParams.get("intent");

  const { product, loading, error } = usePublicProduct({
    uniqueName,
    slug,
  });

  useEffect(() => {
    console.log("🛒 Checkout Page Loaded");
    console.log("🔑 Client Secret:", clientSecret ? "✅ Present" : "❌ Missing");
    console.log("🆔 Intent ID:", intentId);
    console.log("📦 Product:", product);
  }, [product, clientSecret, intentId]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg font-medium">Missing payment information</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-white/70 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg font-medium">
              {error || "Product not found"}
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stripeClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <AlertDescription className="text-red-400">
            Stripe is not configured. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Secure Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            Complete Your Purchase
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Checkout Form - Left Side (Mobile: Full Width, Desktop: 7 cols) */}
          <div className="lg:col-span-7">
            <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-white flex items-center gap-3 text-xl md:text-2xl">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                  </div>
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Elements
                  stripe={stripeClient}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#8b5cf6",
                        colorBackground: "#1e1b4b",
                        colorText: "#ffffff",
                        colorDanger: "#ef4444",
                        fontFamily: "Inter, system-ui, sans-serif",
                        borderRadius: "12px",
                        spacingUnit: "4px",
                      },
                      rules: {
                        ".Input": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "12px",
                        },
                        ".Input:focus": {
                          borderColor: "#8b5cf6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                        ".Label": {
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "500",
                        },
                      },
                    },
                  }}
                >
                  <CheckoutForm clientSecret={clientSecret} product={product} />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Side (Mobile: Full Width, Desktop: 5 cols) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Product Card */}
              <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="text-white text-lg md:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Product Image */}
                  {product.image && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      <Image
                        src={product.image}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg md:text-xl">
                      {product.productName}
                    </h3>
                    {product.description && (
                      <p className="text-sm md:text-base text-white/60 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Pricing Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-white/70">Subtotal</span>
                      <span className="text-white font-medium">${product.amount}</span>
                    </div>
                    
                    {product.payoutChain && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Network</span>
                        <span className="text-white/90 uppercase text-xs font-mono bg-white/5 px-2 py-1 rounded">
                          {product.payoutChain.replace("-", " ")}
                        </span>
                      </div>
                    )}
                    
                    {product.payoutToken && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Payout Token</span>
                        <span className="text-white/90 font-mono bg-white/5 px-2 py-1 rounded text-xs">
                          {product.payoutToken}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Total */}
                  <div className="flex items-center justify-between py-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl px-4 border border-purple-500/20">
                    <span className="text-white font-semibold text-lg">Total</span>
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      ${product.amount}
                    </span>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-blue-400 font-semibold">
                          Protected Payment
                        </p>
                        <p className="text-xs text-white/60">
                          Your payment is secured with bank-level encryption. Card details never touch our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back Button */}
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 hover:border-white/30 transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
