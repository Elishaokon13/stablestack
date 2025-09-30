"use client"

import React, { useEffect, useState } from "react"
import { useUserSession } from "@/hooks/useUserSession"
import { ProductForm, OnboardingForm } from "@/components/forms"
import { ProductCard } from "@/components/cards"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Eye, 
  BarChart3,
  CreditCard,
  Users
} from "lucide-react"

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
}

interface Analytics {
  totalEarnings: {
    usdc: string
    usd: string
  }
  totalProducts: number
  activeProducts: number
  totalPayments: number
  averageOrderValue: string
  recentPayments: Array<{
    id: string
    amountUSDC: string
    amountUSD: string
    status: string
    completedAt: string
    buyerEmail?: string
    buyerName?: string
  }>
}

export default function SellerDashboard() {
  const { user, isAuthenticated, address, needsOnboarding } = useUserSession()
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchData()
    }
  }, [isAuthenticated, user?._id])

  const fetchData = async () => {
    try {
      // Fetch products and analytics in parallel
      const [productsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/products?sellerId=${user?._id}`),
        fetch(`/api/analytics?sellerId=${user?._id}`)
      ])

      const productsResult = await productsResponse.json()
      const analyticsResult = await analyticsResponse.json()

      if (productsResult.success) {
        setProducts(productsResult.products)
      }

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev])
    setShowProductForm(false)
    fetchData() // Refresh analytics
  }

  const handleToggleProduct = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          isActive,
        }),
      })

      if (response.ok) {
        setProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, isActive }
              : product
          )
        )
      }
    } catch (error) {
      console.error('Error toggling product:', error)
    }
  }

  const handleOnboardingComplete = () => {
    fetchData()
  }

  if (!isAuthenticated) {
    return (
      <DashboardPageLayout
        header={{
          title: "Seller Dashboard",
          description: "Connect your wallet to access the dashboard",
          icon: Package,
        }}
      >
        <Card className="ring-2 ring-pop">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              You need to connect your wallet to access the seller dashboard
            </p>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    )
  }

  if (needsOnboarding) {
    return (
      <DashboardPageLayout
        header={{
          title: "Complete Your Profile",
          description: "Set up your seller profile to start accepting payments",
          icon: Users,
        }}
      >
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </DashboardPageLayout>
    )
  }

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Seller Dashboard",
          description: "Loading your dashboard...",
          icon: Package,
        }}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="ring-2 ring-pop">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardPageLayout>
    )
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Seller Dashboard",
        description: "Manage your products and track payments",
        icon: Package,
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="ring-2 ring-pop">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${analytics?.totalEarnings.usd || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ring-2 ring-pop">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalProducts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ring-2 ring-pop">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalPayments || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Payments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.recentPayments.length ? (
                <div className="space-y-3">
                  {analytics.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <div className="font-medium">${payment.amountUSD}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.buyerName || payment.buyerEmail || 'Anonymous'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Completed</Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent payments
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Products</h3>
            <Button
              onClick={() => setShowProductForm(true)}
              style={{ 
                background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </div>

          {showProductForm && (
            <ProductForm
              onSuccess={handleProductCreated}
              onCancel={() => setShowProductForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwner={true}
                onToggleStatus={handleToggleProduct}
                onView={(product) => {
                  window.open(`/pay/${product.paymentLink}`, '_blank')
                }}
              />
            ))}
          </div>

          {products.length === 0 && !showProductForm && (
            <Card className="ring-2 ring-pop">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first product to start accepting payments
                </p>
                <Button
                  onClick={() => setShowProductForm(true)}
                  style={{ 
                    background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sales Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-3xl font-bold">${analytics?.totalEarnings.usd || '0.00'}</div>
                  <div className="text-sm text-muted-foreground">
                    {analytics?.totalEarnings.usdc || '0'} USDC
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Average Order Value</div>
                  <div className="text-3xl font-bold">${analytics?.averageOrderValue || '0.00'}</div>
                  <div className="text-sm text-muted-foreground">Per transaction</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{analytics?.activeProducts || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Products</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{analytics?.totalPayments || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  )
}
