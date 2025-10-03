"use client"

import React, { useEffect, useState } from "react"
// import { useUserSession } from "@/hooks/useUserSession"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  ExternalLink,
  RefreshCw,
  Filter
} from "lucide-react"

interface Payment {
  id: string
  productId: string
  sellerId: string
  buyerId: string
  amountUSDC: string
  transactionHash?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentLink: string
  buyerEmail?: string
  buyerName?: string
  createdAt: string
  completedAt?: string
}

export default function PaymentsPage() {
  // const { user, isAuthenticated, address } = useUserSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  // useEffect(() => {
  //   if (isAuthenticated && address) {
  //     fetchPayments()
  //   }
  // }, [isAuthenticated, address, filter])

  // const fetchPayments = async () => {
  //   try {
  //     const response = await fetch(`/api/payments?sellerId=${address}`)
  //     const result = await response.json()

  //     if (result.success) {
  //       let filteredPayments = result.payments
        
  //       if (filter !== 'all') {
  //         filteredPayments = result.payments.filter((payment: Payment) => payment.status === filter)
  //       }
        
  //       setPayments(filteredPayments)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching payments:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const formatUSDC = (usdcAmount: string) => {
    const amount = parseInt(usdcAmount) / 1e6
    return amount.toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Payments",
          description: "Loading your payments...",
          icon: CreditCard,
        }}
      >
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="ring-2 ring-pop">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardPageLayout>
    )
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Payments",
        description: "View and manage your payment transactions",
        icon: CreditCard,
      }}
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="ring-2 ring-pop">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'failed', label: 'Failed' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(key as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="ring-2 ring-pop">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-lg font-semibold">
                              {formatUSDC(payment.amountUSDC)} USDC
                            </span>
                          </div>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              {payment.buyerName || payment.buyerEmail || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-mono text-xs">
                              {payment.id.slice(-8)}
                            </span>
                          </div>
                        </div>

                        {payment.transactionHash && (
                          <div className="mt-3 p-2 rounded-lg bg-muted">
                            <div className="text-xs text-muted-foreground mb-1">Transaction Hash:</div>
                            <div className="font-mono text-sm break-all">
                              {payment.transactionHash}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/pay/${payment.paymentLink}`, '_blank')
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Product
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="ring-2 ring-pop">
              <CardContent className="p-8 text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "You haven't received any payments yet"
                    : `No ${filter} payments found`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  )
}
