"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CustomPaymentForm from "@/components/payment/custom-payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Package, DollarSign, User, Calendar, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  priceUSD: number
  priceUSDC: string
  paymentLink: string
  isActive: boolean
  imageUrl?: string
  category?: string
  createdAt: string
  sellerId: string
}

export default function PaymentPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/payment-links/${slug}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Payment link not found')
        }

        setProduct(result.product)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment link')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setPaymentSuccess(true);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="ring-2 ring-pop">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
            <Card className="ring-2 ring-pop">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Product:</span>
                  <span className="text-sm font-bold">{product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-bold">${product?.priceUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Payment ID:</span>
                  <span className="text-sm font-mono text-xs">
                    {paymentIntentId}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  The merchant will receive stablecoins automatically. Thank you for your purchase!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card className="ring-2 ring-pop">
            <CardContent className="p-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
              <p className="text-muted-foreground mb-4">
                {error || "The product you're looking for doesn't exist or has been removed."}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Go back to home
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!product.isActive) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card className="ring-2 ring-pop">
            <CardContent className="p-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-semibold mb-2">Product Unavailable</h1>
              <p className="text-muted-foreground mb-4">
                This product is currently not available for purchase.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Go back to home
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Product Details */}
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    {product.name}
                  </CardTitle>
                  {product.category && (
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${product.priceUSD.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    USD
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Image */}
              {product.imageUrl ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-mono">
                    {product.sellerId.slice(0, 6)}...{product.sellerId.slice(-4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <div className="space-y-6">
            <CustomPaymentForm
              amount={product.priceUSD}
              currency="usd"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              productName={product.name}
              description={product.description}
            />

            {/* Payment Info */}
            <Card className="ring-2 ring-pop">
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="text-sm font-medium">Credit/Debit Card</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing:</span>
                  <span className="text-sm font-medium">Stripe</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time:</span>
                  <span className="text-sm font-medium">Instant</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${product.priceUSD.toFixed(2)} USD
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Merchant receives stablecoins automatically
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="ring-2 ring-pop">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Secure Payment:</strong> Your payment is processed securely by Stripe. 
                  Card details are encrypted and never stored on our servers.
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
