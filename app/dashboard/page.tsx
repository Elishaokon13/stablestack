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

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

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
        <div className="w-full py-4 flex flex-col gap-2">
          <h1 className="text-xl font-bold text-white">
            Welcome back, {user.firstName || user.username}!
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Earnings Card */}
          <div className="bg-white/10 border-white/20 p-4 rounded-md flex flex-col gap-4 h-32 justify-center">
            <div className="text-3xl font-bold">$4,250.00</div>
            <div className="text-muted-foreground text-sm">Earnings</div>
          </div>
          {/* Products Card */}
          <div className="bg-white/10 border-white/20 p-4 rounded-md flex flex-col gap-4 h-32 justify-center">
            <div className="text-3xl font-bold">12</div>
            <div className="text-muted-foreground text-sm">Active products</div>
          </div>
          {/* Orders Card */}
          <div className="bg-white/10 border-white/20 p-4 rounded-md flex flex-col gap-4 h-32 justify-center">
            <div className="text-3xl font-bold">37</div>
            <div className="text-muted-foreground text-sm">Total orders</div>
          </div>
          <div className="bg-white/10 border-white/20 p-4 rounded-md flex flex-col gap-4 h-32 justify-center">
            <div className="text-3xl font-bold">37</div>
            <div className="text-muted-foreground text-sm">Total customers</div>
          </div>
        </div>

        <Separator />

        {/* Sales Activity Heatmap */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Sales Activity Heatmap (Last 52 Weeks)
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Transactions */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Latest Transactions
                    </h3>
                    <p className="text-xs text-gray-400">
                      Recent payment activity
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  onClick={() => router.push("/payments")}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
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
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      transaction.status === "completed"
                        ? "bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40"
                        : transaction.status === "pending"
                        ? "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40"
                        : "bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40"
                    } hover:shadow-lg hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          transaction.status === "completed"
                            ? "bg-green-500/20 text-green-400 group-hover:bg-green-500/30"
                            : transaction.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30"
                            : "bg-red-500/20 text-red-400 group-hover:bg-red-500/30"
                        }`}
                      >
                        {transaction.status === "completed" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : transaction.status === "pending" ? (
                          <Package className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold text-sm truncate">
                            {transaction.customer}
                          </p>
                          <Badge
                            className={`text-xs font-medium ${
                              transaction.status === "completed"
                                ? "bg-green-500/30 text-green-300 border-green-500/40"
                                : transaction.status === "pending"
                                ? "bg-yellow-500/30 text-yellow-300 border-yellow-500/40"
                                : "bg-red-500/30 text-red-300 border-red-500/40"
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-xs font-medium mb-0.5">
                          {transaction.product}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {transaction.date} • {transaction.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">
                        ${transaction.amount.toFixed(2)}
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
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Product Link Analytics
                  </h3>
                  <p className="text-xs text-gray-400">Views by product type</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
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
                    height={300}
                  />
                </div>

                {/* Stats Below Chart */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-400">
                        Total Views
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">1,333</p>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                      <p className="text-xs text-green-400 font-medium">
                        +12% from last week
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-400">
                        Active Links
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">5</p>
                    <p className="text-xs text-blue-400 font-medium">
                      All products
                    </p>
                  </div>
                </div>

                {/* Link Performance */}
                <div className="space-y-3 mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
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
                      className={`flex items-center gap-3 p-3 bg-gradient-to-r ${link.gradient} rounded-lg border border-white/10 hover:border-white/20 transition-all`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${link.color} shadow-lg`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-white">
                            {link.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            <p className="text-xs font-semibold text-gray-300">
                              {link.views}
                            </p>
                          </div>
                        </div>
                        <div className="relative w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${link.color} h-2 rounded-full shadow-lg transition-all duration-500`}
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

        <Separator />

        {/* User Info Card */}
        <Card className="mb-8 backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <User className="w-6 h-6" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-purple-200 text-sm">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Member Since</p>
                    <p className="text-purple-200 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Account Status</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Verified
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Username</p>
                    <p className="text-purple-200 text-sm">
                      {user.username || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Wallet</h3>
                  <p className="text-purple-200 text-sm">
                    Manage your crypto wallet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Payments</h3>
                  <p className="text-purple-200 text-sm">Process payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Analytics</h3>
                  <p className="text-purple-200 text-sm">View your stats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Settings</h3>
                  <p className="text-purple-200 text-sm">Account settings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out Button */}
        <div className="text-center">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
