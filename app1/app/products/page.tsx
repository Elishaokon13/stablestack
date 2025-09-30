"use client";

import React, { useState, useEffect } from "react";
import { useUserSession } from "@/hooks/useUserSession";
import DashboardPageLayout from "@/components/dashboard/layout";
import { ProductForm } from "@/components/forms";
import { ProductCard } from "@/components/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Plus, Package, Loader2, ExternalLink } from "lucide-react";
import { AppKitButton } from "@/components/auth";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading: isUserSessionLoading, needsOnboarding } = useUserSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  useEffect(() => {
    if (!isUserSessionLoading && !isAuthenticated) {
      router.push("/test-wallet") // Redirect to wallet connect if not authenticated
    }
  }, [isAuthenticated, isUserSessionLoading, router])

  useEffect(() => {
    if (isAuthenticated && user?.address) {
      fetchProducts(user.address)
    }
  }, [isAuthenticated, user?.address])

  const fetchProducts = async (sellerId: string) => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch(`/api/products?sellerId=${sellerId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      console.log("Products API response:", data)
      if (data.success && data.products) {
        setProducts(data.products)
      } else {
        setProducts([])
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching products.")
      console.error("Error fetching products:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true)
  }

  const handleProductCreated = () => {
    setIsCreateModalOpen(false)
    if (user?.address) {
      fetchProducts(user.address) // Refresh products list
    }
  }

  if (isUserSessionLoading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Loading Products",
          description: "Please wait...",
          icon: Loader2,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-display text-primary-foreground">Loading M.O.N.K.Y OS...</h2>
          <p className="text-muted-foreground mt-2">Preparing your product management system.</p>
      </div>
      </DashboardPageLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <DashboardPageLayout
        header={{
          title: "Products",
          description: "Connect your wallet to manage products",
          icon: Package,
        }}
      >
        <Card className="ring-2 ring-pop">
          <CardContent className="p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to view and manage products
            </p>
            <Button 
              onClick={() => router.push("/test-wallet")} 
              style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    )
  }

  if (needsOnboarding) {
    return (
      <DashboardPageLayout
        header={{
          title: "Products",
          description: "Complete onboarding to manage products",
          icon: Package,
        }}
      >
        <Card className="ring-2 ring-pop">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Complete Onboarding First</h3>
            <p className="text-muted-foreground mb-6">
              Please complete your profile setup before managing products
            </p>
            <Button 
              onClick={() => router.push("/dashboard")} 
              style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
            >
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    )
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Products",
        description: "Manage your products and payment links",
        icon: Package,
      }}
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Products</h2>
            <p className="text-muted-foreground">
              Create and manage products that accept USDC payments
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleCreateProduct}
              style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id?.toString() || product.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="ring-2 ring-pop h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-display text-primary-foreground">
                        {product.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 text-xs ${
                          product.isActive
                            ? "bg-green-900/20 text-green-400 border-green-700/50"
                            : "bg-red-900/20 text-red-400 border-red-700/50"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {product.description || "No description provided."}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-primary" style={{ color: '#ff5941' }}>
                        ${product.priceUSD.toFixed(2)} USD
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Number(product.priceUSDC).toFixed(6)} USDC (on Base)
                      </p>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const paymentLink = `${window.location.origin}/pay/${product.paymentLink}`
                          navigator.clipboard.writeText(paymentLink)
                          toast.success("Payment link copied to clipboard!")
                        }}
                        className="w-full justify-start text-left"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Copy Payment Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/pay/${product.paymentLink}`, '_blank')}
                        className="w-full justify-start text-left"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Payment Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="ring-2 ring-pop">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first product to accept USDC payments
              </p>
              <Button
                onClick={handleCreateProduct}
                style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Product Modal */}
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Create New Product</h3>
                <ProductForm onSuccess={handleProductCreated} />
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
