"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { ProductLinkModal } from "@/components/payment/product-link-modal";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isProductLinkModalOpen, setIsProductLinkModalOpen] = useState(false);

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
        <div className="w-full py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-white">
            Welcome back, {user.firstName || user.username}!
          </h1>
          <Button
            className="border-white/20 text-white hover:bg-blue-600 w-full sm:w-auto whitespace-nowrap"
            onClick={() => setIsProductLinkModalOpen(true)}
          >
            Create Product Link
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Earnings Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              $4,250
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Earnings
            </div>
          </div>
          {/* Products Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">12</div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Active products
            </div>
          </div>
          {/* Orders Card */}
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">37</div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Total orders
            </div>
          </div>
          <div className="bg-white/10 border-white/20 p-3 sm:p-4 rounded-md flex flex-col gap-2 sm:gap-4 h-28 sm:h-32 justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">37</div>
            <div className="text-muted-foreground text-xs sm:text-sm">
              Total customers
            </div>
          </div>
        </div>

        <Separator />

        {/* Sales Activity Heatmap */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 px-1">
            Sales Activity Heatmap (Last 52 Weeks)
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 md:p-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-3 ml-16">
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((month, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground font-medium"
                      style={{
                        width: "calc(100% / 12)",
                        textAlign: "left",
                        paddingLeft: "4px",
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-2">
                  {/* Day labels */}
                  <div className="flex flex-col justify-around text-xs text-muted-foreground pr-3">
                    <div>Mon</div>
                    <div>Wed</div>
                    <div>Fri</div>
                  </div>

                  {/* Grid of weeks */}
                  <div className="flex gap-2">
                    {Array.from({ length: 52 }).map((_, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-2">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          // Generate semi-random sales data for demo
                          const seed = weekIndex * 7 + dayIndex;
                          const salesValue = Math.floor(
                            Math.sin(seed * 0.5) * 30 +
                              Math.cos(seed * 0.3) * 20 +
                              Math.random() * 25 +
                              10
                          );

                          // Determine color intensity (blue theme)
                          let bgColor = "";
                          let borderColor = "";
                          if (salesValue === 0) {
                            bgColor = "bg-slate-800/40";
                            borderColor = "border-slate-700/50";
                          } else if (salesValue < 15) {
                            bgColor = "bg-blue-950/60";
                            borderColor = "border-blue-900/60";
                          } else if (salesValue < 30) {
                            bgColor = "bg-blue-800/70";
                            borderColor = "border-blue-700/70";
                          } else if (salesValue < 45) {
                            bgColor = "bg-blue-600/80";
                            borderColor = "border-blue-500/80";
                          } else {
                            bgColor = "bg-blue-500";
                            borderColor = "border-blue-400";
                          }

                          // Calculate date
                          const today = new Date();
                          const daysAgo = (51 - weekIndex) * 7 + (6 - dayIndex);
                          const date = new Date(today);
                          date.setDate(date.getDate() - daysAgo);
                          const dateStr = date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });

                          return (
                            <div
                              key={dayIndex}
                              className={`w-3.5 h-3.5 rounded ${bgColor} border ${borderColor} hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 hover:ring-offset-slate-900 transition-all cursor-pointer group relative hover:scale-110`}
                              title={`${dateStr}: ${salesValue} sales`}
                            >
                              {/* Tooltip on hover */}
                              <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap border border-white/20">
                                <div className="font-semibold">
                                  {salesValue} sales
                                </div>
                                <div className="text-gray-400">{dateStr}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                  <div className="border-4 border-transparent border-t-slate-800" />
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
                  <div className="w-3.5 h-3.5 rounded bg-slate-800/40 border border-slate-700/50" />
                  <div className="w-3.5 h-3.5 rounded bg-blue-950/60 border border-blue-900/60" />
                  <div className="w-3.5 h-3.5 rounded bg-blue-800/70 border border-blue-700/70" />
                  <div className="w-3.5 h-3.5 rounded bg-blue-600/80 border border-blue-500/80" />
                  <div className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400" />
                  <span className="text-xs text-muted-foreground">More</span>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-xs text-muted-foreground">
                      Total Sales
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">24</div>
                    <div className="text-xs text-muted-foreground">
                      Avg Daily Sales
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">78</div>
                    <div className="text-xs text-muted-foreground">
                      Best Day
                    </div>
                  </div>
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
                {[
                  {
                    id: "TXN-001",
                    customer: "John Doe",
                    amount: 129.99,
                    status: "completed",
                    date: "2 hours ago",
                    product: "Premium Plan",
                  },
                  {
                    id: "TXN-002",
                    customer: "Jane Smith",
                    amount: 49.99,
                    status: "completed",
                    date: "5 hours ago",
                    product: "Basic Plan",
                  },
                  {
                    id: "TXN-003",
                    customer: "Mike Johnson",
                    amount: 199.99,
                    status: "pending",
                    date: "8 hours ago",
                    product: "Enterprise Plan",
                  },
                  {
                    id: "TXN-004",
                    customer: "Sarah Williams",
                    amount: 79.99,
                    status: "completed",
                    date: "1 day ago",
                    product: "Pro Plan",
                  },
                  {
                    id: "TXN-005",
                    customer: "Tom Brown",
                    amount: 29.99,
                    status: "failed",
                    date: "2 days ago",
                    product: "Starter Plan",
                  },
                ].map((transaction, index) => (
                  <div
                    key={index}
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

          {/* Product Link Analytics Pie Chart */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    Product Link Analytics
                  </h3>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Views by product type
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
                        "Premium Plan",
                        "Basic Plan",
                        "Enterprise Plan",
                        "Pro Plan",
                        "Starter Plan",
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
                                label: "Total Views",
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
                            return val + " views";
                          },
                        },
                      },
                    }}
                    series={[342, 218, 156, 428, 189]}
                    type="donut"
                    height={280}
                  />
                </div>

                {/* Stats Below Chart */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-3 sm:p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                        Total Views
                      </p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      1,333
                    </p>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 flex-shrink-0" />
                      <p className="text-[10px] sm:text-xs text-green-400 font-medium truncate">
                        +12% from last week
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                        Active Links
                      </p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      5
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-400 font-medium">
                      All products
                    </p>
                  </div>
                </div>

                {/* Link Performance */}
                <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                    <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    Top Performing Links
                  </p>
                  {[
                    {
                      name: "Pro Plan",
                      views: 428,
                      color: "bg-amber-500",
                      gradient: "from-amber-500/20 to-amber-600/5",
                    },
                    {
                      name: "Premium Plan",
                      views: 342,
                      color: "bg-blue-500",
                      gradient: "from-blue-500/20 to-blue-600/5",
                    },
                    {
                      name: "Basic Plan",
                      views: 218,
                      color: "bg-green-500",
                      gradient: "from-green-500/20 to-green-600/5",
                    },
                  ].map((link, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r ${link.gradient} rounded-lg border border-white/10 hover:border-white/20 transition-all`}
                    >
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${link.color} shadow-lg flex-shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2 gap-2">
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {link.name}
                          </p>
                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-300">
                              {link.views}
                            </p>
                          </div>
                        </div>
                        <div className="relative w-full bg-white/10 rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <div
                            className={`${link.color} h-1.5 sm:h-2 rounded-full shadow-lg transition-all duration-500`}
                            style={{ width: `${(link.views / 428) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
          console.log("Product created:", product);
          setIsProductLinkModalOpen(false);
          // Optionally refresh the page or show a success message
        }}
      />
    </>
  );
}
