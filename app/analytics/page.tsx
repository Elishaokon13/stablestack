"use client";

import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  DollarSign,
  Package,
  CreditCard,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";

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

export default function AnalyticsPage() {
  const [analytics] = useState<Analytics | null>(null);

  return (
    <DashboardPageLayout
      header={{
        title: "Analytics",
        description: "Track your sales performance and earnings",
        icon: BarChart3,
      }}
    >
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sales Analytics</h2>
            <p className="text-muted-foreground">
              Track your payment performance and earnings
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              // onClick={fetchAnalytics}
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${analytics?.totalEarnings.usd || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {analytics?.totalEarnings.usdc || '0'} USDC
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalPayments || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalProducts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {analytics?.activeProducts || 0} active
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${analytics?.averageOrderValue || '0.00'}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Order Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue (USD)</span>
                    <span className="font-semibold">${analytics?.totalEarnings.usd || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue (USDC)</span>
                    <span className="font-semibold">{analytics?.totalEarnings.usdc || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Order Value</span>
                    <span className="font-semibold">${analytics?.averageOrderValue || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Products</span>
                    <span className="font-semibold">{analytics?.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Products</span>
                    <span className="font-semibold">{analytics?.activeProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-semibold">
                      {analytics?.totalProducts 
                        ? ((analytics.totalPayments / analytics.totalProducts) * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.recentPayments.length ? (
                <div className="space-y-3">
                  {analytics.recentPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <div className="font-medium">${payment.amountUSD}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.buyerName || payment.buyerEmail || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Completed</Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent payments
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardPageLayout>
  )
}
