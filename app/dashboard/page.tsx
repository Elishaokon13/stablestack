"use client";

import React from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

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

  const handleSignOut = () => {
    // Clerk handles sign out automatically
    window.location.href = "/";
  };

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
                              className={`w-3 h-3 rounded ${bgColor} border ${borderColor} hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 hover:ring-offset-slate-900 transition-all cursor-pointer group relative hover:scale-110`}
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
                  <div className="w-3 h-3 rounded bg-slate-800/40 border border-slate-700/50" />
                  <div className="w-3 h-3 rounded bg-blue-950/60 border border-blue-900/60" />
                  <div className="w-3 h-3 rounded bg-blue-800/70 border border-blue-700/70" />
                  <div className="w-3 h-3 rounded bg-blue-600/80 border border-blue-500/80" />
                  <div className="w-3 h-3 rounded bg-blue-500 border border-blue-400" />
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">$0.00</div>
                <p className="text-purple-200">Total Revenue</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <p className="text-purple-200">Transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <p className="text-purple-200">Active Links</p>
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
            <LogOut className="w-3 h-3 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
