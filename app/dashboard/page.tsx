"use client";

import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { ProductLinkModal } from "@/components/payment/product-link-modal";
import { TransactionReceiptModal } from "@/components/ui/transaction-receipt-modal";
import { PaymentLinkCreatorModal } from "@/components/ui/payment-link-creator-modal";
import {
  useEarnings,
  useSalesHeatmap,
  useTransactions,
} from "@/lib/hooks/payment";
import { useProductStats } from "@/lib/hooks/product";
import { useWalletBalance } from "@/lib/hooks/wallet/use-wallet-balance";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isProductLinkModalOpen, setIsProductLinkModalOpen] = useState(false);

  // Fetch real data from API
  const { earnings } = useEarnings();
  const { heatmapData } = useSalesHeatmap();
  const { transactions: apiTransactions, loading: transactionsLoading } =
    useTransactions({ limit: 5 });
  const { stats: productStats } = useProductStats();
  const { balance, loading: balanceLoading } = useWalletBalance({
    chain: "base-sepolia",
    autoFetch: true,
  });
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Use API transactions or fallback to demo data
  const displayTransactions =
    apiTransactions && apiTransactions.length > 0
      ? apiTransactions.map((tx) => {
          console.log("📊 Transaction data:", tx);
          return {
            id: tx.id || "unknown",
            customer: tx.customerName || tx.customerEmail || "Anonymous",
            amount: tx.amount ? parseFloat(tx.amount) : 0,
            status:
              tx.status === "SUCCEEDED"
                ? ("completed" as const)
                : tx.status === "PROCESSING"
                ? ("pending" as const)
                : ("failed" as const),
            date: tx.createdAt
              ? new Date(tx.createdAt).toLocaleDateString()
              : "N/A",
            product: tx.slug || tx.productId || "N/A",
            email: tx.customerEmail || "",
            paymentIntentId: tx.paymentIntentId || "",
          };
        })
      : [
          {
            id: "DEMO-001",
            customer: "No transactions yet",
            amount: 0,
            status: "completed" as const,
            date: "Create your first product",
            product: "Demo Product",
          },
        ];

  // Helper function to get sales value for a specific date from heatmap data
  const getSalesForDate = (date: Date): number => {
    if (!heatmapData || !heatmapData.weeks || heatmapData.weeks.length === 0) {
      // Fallback to demo data if API data not available
      const seed = Math.floor(Math.random() * 365);
      return Math.floor(
        Math.sin(seed * 0.5) * 30 +
          Math.cos(seed * 0.3) * 20 +
          Math.random() * 25 +
          10
      );
    }

    const dateStr = date.toISOString().split("T")[0];
    // Search through weeks and days
    for (const week of heatmapData.weeks) {
      const dayData = week.days.find((d) => d.date === dateStr);
      if (dayData) {
        return dayData.count;
      }
    }
    return 0;
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsReceiptModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You need to be signed in to access the dashboard.
          </p>
          <Button onClick={() => router.push("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6 mx-auto">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-white">
            Welcome back, {user.firstName || user.username}!
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto whitespace-nowrap font-semibold"
              onClick={() => setIsPaymentLinkModalOpen(true)}
            >
              Create Payment Link
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto whitespace-nowrap"
              onClick={() => setIsProductLinkModalOpen(true)}
            >
              Create Product Link
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
              {balanceLoading ? (
                <span className="text-base">Loading...</span>
              ) : balance?.balances && balance.balances.length > 0 ? (
                `$${parseFloat(
                  balance.balances[0].convertedBalance
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              ) : (
                "$0.00"
              )}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Wallet Balance
            </div>
          </div>
          {/* Total Revenue Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              $
              {parseFloat(earnings?.succeeded?.amount || "0").toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Total Revenue
            </div>
          </div>

          {/* Active Products Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              {productStats?.active ?? 0}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Active products
            </div>
          </div>
          {/* Total Products Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              {productStats?.total ?? 0}
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Total products
            </div>
          </div>
        </div>

        {/* Sales Activity Heatmap */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 px-1">
            Sales Activity Heatmap (Last 6 Months)
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 md:p-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels - showing last 6 months */}
                <div className="flex mb-3 ml-16">
                  {(() => {
                    const months = [];
                    const today = new Date();
                    for (let i = 5; i >= 0; i--) {
                      const date = new Date(today);
                      date.setMonth(date.getMonth() - i);
                      months.push(
                        date.toLocaleDateString("en-US", { month: "short" })
                      );
                    }
                    return months.map((month, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground font-medium"
                        style={{
                          width: "calc(100% / 6)",
                          textAlign: "left",
                          paddingLeft: "4px",
                        }}
                      >
                        {month}
                      </div>
                    ));
                  })()}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-2">
                  {/* Day labels */}
                  <div className="flex flex-col justify-around text-xs text-muted-foreground pr-3">
                    <div>Mon</div>
                    <div>Wed</div>
                    <div>Fri</div>
                  </div>

                  {/* Grid of weeks - 26 weeks for 6 months */}
                  <div className="flex gap-2">
                    {Array.from({ length: 26 }).map((_, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-2">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          // Calculate date for this cell
                          const today = new Date();
                          const daysAgo = (25 - weekIndex) * 7 + (6 - dayIndex);
                          const date = new Date(today);
                          date.setDate(date.getDate() - daysAgo);

                          // Get sales value from API or demo data
                          const salesValue = getSalesForDate(date);

                          // Determine color intensity (brand blue theme)
                          let bgColor = "";
                          let borderColor = "";
                          if (salesValue === 0) {
                            bgColor = "bg-muted/40";
                            borderColor = "border-muted/50";
                          } else if (salesValue < 15) {
                            bgColor = "bg-primary/20";
                            borderColor = "border-primary/30";
                          } else if (salesValue < 30) {
                            bgColor = "bg-primary/40";
                            borderColor = "border-primary/50";
                          } else if (salesValue < 45) {
                            bgColor = "bg-primary/60";
                            borderColor = "border-primary/70";
                          } else {
                            bgColor = "bg-primary";
                            borderColor = "border-primary";
                          }

                          // Format date for display
                          const dateStr = date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });

                          return (
                            <div
                              key={dayIndex}
                              className={`w-3.5 h-3.5 rounded ${bgColor} border ${borderColor} hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background transition-all cursor-pointer group relative hover:scale-110`}
                              title={`${dateStr}: ${salesValue} sales`}
                            >
                              {/* Tooltip on hover */}
                              <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-white/10 text-foreground text-xs rounded-lg shadow-xl whitespace-nowrap">
                                <div className="font-semibold">
                                  {salesValue} sales
                                </div>
                                <div className="text-muted-foreground">
                                  {dateStr}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                  <div className="border-4 border-transparent border-t-card" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-2 mt-4 items-center justify-end">
                  <span className="text-xs text-muted-foreground">Less</span>
                  <div className="w-3.5 h-3.5 rounded bg-muted/40 border border-muted/50" />
                  <div className="w-3.5 h-3.5 rounded bg-primary/20 border border-primary/30" />
                  <div className="w-3.5 h-3.5 rounded bg-primary/40 border border-primary/50" />
                  <div className="w-3.5 h-3.5 rounded bg-primary/60 border border-primary/70" />
                  <div className="w-3.5 h-3.5 rounded bg-primary border border-primary" />
                  <span className="text-xs text-muted-foreground">More</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Latest Transactions and Product Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Latest Transactions */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                      Latest Transactions
                    </h3>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Recent payment activity
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs sm:text-sm flex-shrink-0"
                  onClick={() => router.push("/payments")}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6">
              <div className="space-y-3">
                {displayTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    onClick={() => handleTransactionClick(transaction)}
                    className="group flex items-center justify-between p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      {/* Status Indicator Dot */}
                      <div className="flex items-center justify-center flex-shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.status === "completed"
                              ? "bg-green-400"
                              : transaction.status === "pending"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold text-xs sm:text-sm truncate">
                            {transaction.customer}
                          </p>
                          <span
                            className={`text-[10px] sm:text-xs font-medium capitalize ${
                              transaction.status === "completed"
                                ? "text-green-400"
                                : transaction.status === "pending"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            • {transaction.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 truncate">
                          {transaction.product}
                        </p>
                        <p className="text-gray-500 text-[10px] sm:text-xs truncate">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-white font-bold text-sm sm:text-base whitespace-nowrap">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        {transaction.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Performance Analytics */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    Product Performance
                  </h3>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Sales performance by product
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6">
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <Chart
                    options={{
                      chart: {
                        type: "donut",
                        background: "transparent",
                      },
                      labels: [
                        "Digital Courses",
                        "Software Licenses",
                        "Consulting Services",
                        "E-books & Guides",
                        "Online Workshops",
                      ],
                      colors: [
                        "#3b82f6",
                        "#10b981",
                        "#8b5cf6",
                        "#f59e0b",
                        "#ef4444",
                      ],
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: "#ffffff",
                        },
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "70%",
                            labels: {
                              show: true,
                              name: {
                                show: true,
                                color: "#ffffff",
                              },
                              value: {
                                show: true,
                                color: "#ffffff",
                                fontSize: "24px",
                                fontWeight: "bold",
                              },
                              total: {
                                show: true,
                                label: "Total Sales",
                                color: "#ffffff",
                                formatter: function (w: any) {
                                  return w.globals.seriesTotals
                                    .reduce((a: number, b: number) => a + b, 0)
                                    .toString();
                                },
                              },
                            },
                          },
                        },
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      tooltip: {
                        theme: "dark",
                        y: {
                          formatter: function (val: number) {
                            return val + " sales";
                          },
                        },
                      },
                    }}
                    series={[342, 218, 156, 428, 189]}
                    type="donut"
                    height={280}
                  />
                </div>

                {/* Product Performance Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-3 sm:p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                        Total Revenue
                      </p>
                    </div>
                    <p className="text-xl sm:text-3xl font-bold text-white mb-1">
                      $12,450
                    </p>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
                      <p className="text-[10px] sm:text-xs text-green-400 font-medium">
                        +18% from last month
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                        Products Sold
                      </p>
                    </div>
                    <p className="text-xl sm:text-3xl font-bold text-white mb-1">
                      1,333
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-400 font-medium">
                      Across all categories
                    </p>
                  </div>
                </div>

                {/* Product Status Breakdown */}
                <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full block" />
                    Product Status
                  </div>
                  {[
                    {
                      name: "Active Products",
                      count: productStats?.active ?? 0,
                      color: "bg-green-500",
                      gradient: "from-green-500/20 to-green-600/5",
                      icon: "✅",
                    },
                    {
                      name: "Total Products",
                      count: productStats?.total ?? 0,
                      color: "bg-blue-500",
                      gradient: "from-blue-500/20 to-blue-600/5",
                      icon: "📦",
                    },
                    {
                      name: "Expired Products",
                      count: productStats?.expired ?? 0,
                      color: "bg-amber-500",
                      gradient: "from-amber-500/20 to-amber-600/5",
                      icon: "⏰",
                    },
                    {
                      name: "Cancelled Products",
                      count: productStats?.cancelled ?? 0,
                      color: "bg-red-500",
                      gradient: "from-red-500/20 to-red-600/5",
                      icon: "❌",
                    },
                  ].map((status, index) => {
                    const maxCount = Math.max(productStats?.total ?? 0, 1);
                    const percentage = (status.count / maxCount) * 100;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r ${status.gradient} rounded-lg border border-white/10 hover:border-white/20 transition-all`}
                      >
                        <div className="text-base sm:text-lg flex-shrink-0">
                          {status.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5 sm:mb-2 gap-2">
                            <p className="text-xs sm:text-sm font-medium text-white truncate">
                              {status.name}
                            </p>
                            <p className="text-[10px] sm:text-xs font-semibold text-white flex-shrink-0">
                              {status.count}
                            </p>
                          </div>
                          <div className="relative w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                            <div
                              className={`${status.color} h-1.5 sm:h-2 rounded-full shadow-lg transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Link Modal */}
      <ProductLinkModal
        isOpen={isProductLinkModalOpen}
        onClose={() => setIsProductLinkModalOpen(false)}
        onSuccess={(product: any) => {
          setIsProductLinkModalOpen(false);
        }}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Payment Link Creator Modal */}
      <PaymentLinkCreatorModal
        isOpen={isPaymentLinkModalOpen}
        onClose={() => setIsPaymentLinkModalOpen(false)}
        onSuccess={(paymentLink) => {
          setIsPaymentLinkModalOpen(false);
        }}
      />
    </>
  );
}
