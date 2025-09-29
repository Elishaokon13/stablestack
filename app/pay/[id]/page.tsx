"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Product, ProductStatus } from "../../../types/payments";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

// Mock product data - in real app, this would come from API
const mockProducts: Product[] = [
  {
    id: "1",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "Premium Digital Art Collection",
    description: "A stunning collection of digital artworks created by renowned artists. Perfect for NFT collectors and art enthusiasts.",
    price: 299.99,
    priceInUSDC: "299990000",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: "digital_goods" as any,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "Web3 Development Course",
    description: "Complete course covering smart contracts, DeFi protocols, and blockchain development. Includes hands-on projects and certification.",
    price: 199.00,
    priceInUSDC: "199000000",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    category: "services" as any,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
];

export default function PaymentPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch product
    const fetchProduct = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundProduct = mockProducts.find(p => p.id === productId);
      setProduct(foundProduct || null);
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setPaymentSuccess(true);
    setIsProcessing(false);
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert>
              <AlertDescription>
                Payment link not found or has been deactivated.
              </AlertDescription>
            </Alert>
            <Link href="/">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment has been processed and USDC has been sent to the seller's wallet.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Product: <span className="font-medium">{product.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-medium">${product.price}</span>
              </p>
            </div>
            <Link href="/">
              <Button className="mt-6 w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Link href="/products">
            <Button variant="ghost" className="mb-6 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Payment Links
            </Button>
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Secure Payment
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powered by Stripe • Funds instantly converted to USDC on Base network
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">USDC on Base</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.imageUrl && (
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{product.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full">
                    {product.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full">
                    ✓ ACTIVE
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Seller</p>
                      <p className="font-mono text-sm text-slate-900 dark:text-white">
                        {product.sellerId.slice(0, 6)}...{product.sellerId.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Display */}
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${product.price}
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ {(parseInt(product.priceInUSDC) / 1000000).toFixed(2)} USDC on Base
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>Pay with any card via Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instantly converted to USDC</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <span>Sent to seller's Base wallet</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ${product.price}
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="text-xs text-muted-foreground text-center">
                <p>🔒 Your payment is secured by Stripe's industry-leading security</p>
                <p>💎 Funds are automatically converted to USDC and sent to the seller</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
