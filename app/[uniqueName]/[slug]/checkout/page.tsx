"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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
} from "lucide-react";
import Image from "next/image";

function CheckoutForm({
  clientSecret,
  product,
}: {
  clientSecret: string;
  product: any;
}) {
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

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
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
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
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
        <Label htmlFor="email" className="font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Receipt will be sent to this email
        </p>
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        <Label className="font-medium">Payment Information</Label>
        <div className="p-4 border rounded-lg">
          <PaymentElement />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-4 py-4 border-y">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Secured by Stripe</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>SSL Encrypted</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isProcessing}
        className="w-full h-14 font-semibold text-base"
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
        <div className="px-3 py-1.5 bg-muted border rounded-full">
          <span className="text-xs font-medium">PCI Compliant</span>
        </div>
        <div className="px-3 py-1.5 bg-muted border rounded-full">
          <span className="text-xs font-medium">256-bit SSL</span>
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
    console.log(
      "🔑 Client Secret:",
      clientSecret ? "✅ Present" : "❌ Missing"
    );
    console.log("🆔 Intent ID:", intentId);
    console.log("📦 Product:", product);
  }, [product, clientSecret, intentId]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-destructive text-lg font-medium">
              Missing payment information
            </p>
            <Button onClick={() => router.back()} variant="outline">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-muted-foreground animate-spin mx-auto" />
          <p className="text-muted-foreground text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-destructive text-lg font-medium">
              {error || "Product not found"}
            </p>
            <Button onClick={() => router.back()} variant="outline">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertDescription>
            Stripe is not configured. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-muted border rounded-full">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Secure Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Complete Your Purchase
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Checkout Form - Left Side (Mobile: Full Width, Desktop: 7 cols) */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader className="border-b pb-6">
                <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                  <div className="p-2 bg-muted rounded-lg">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
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
                      theme: "stripe",
                      variables: {
                        fontFamily: "Inter, system-ui, sans-serif",
                        borderRadius: "8px",
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
              <Card>
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg md:text-xl">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Product Image */}
                  {product.image && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border">
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
                    <h3 className="font-semibold text-lg md:text-xl">
                      {product.productName}
                    </h3>
                    {product.description && (
                      <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Pricing Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${product.amount}</span>
                    </div>

                    {product.payoutChain && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Network</span>
                        <span className="uppercase text-xs font-mono bg-muted px-2 py-1 rounded">
                          {product.payoutChain.replace("-", " ")}
                        </span>
                      </div>
                    )}

                    {product.payoutToken && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Payout Token
                        </span>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          {product.payoutToken}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex items-center justify-between py-4 bg-muted rounded-lg px-4 border">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="text-2xl md:text-3xl font-bold">
                      ${product.amount}
                    </span>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 bg-muted border rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm font-semibold">
                          Protected Payment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your payment is secured with bank-level encryption.
                          Card details never touch our servers.
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
                className="w-full"
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
