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


        {/* Sales Heatmap */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Sales Heatmap (2024)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-xs text-muted-foreground px-2 py-1">Month</th>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <th key={i} className="text-xs text-muted-foreground px-2 py-1">
                      {new Date(0, i).toLocaleString("default", { month: "short" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-xs text-muted-foreground px-2 py-1">Sales</td>
                  {/* Example static data for each month */}
                  {[
                    12, 22, 18, 30, 25, 40, 55, 48, 35, 28, 20, 15
                  ].map((value, i) => {
                    // Color intensity based on value
                    let bg = "";
                    if (value > 45) bg = "bg-purple-600";
                    else if (value > 30) bg = "bg-purple-500";
                    else if (value > 20) bg = "bg-purple-400";
                    else if (value > 10) bg = "bg-purple-300";
                    else bg = "bg-purple-200";
                    return (
                      <td
                        key={i}
                        className={`w-10 h-10 text-center align-middle rounded ${bg} text-white font-semibold transition-colors`}
                        title={`${new Date(0, i).toLocaleString("default", { month: "long" })}: ${value} sales`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2 items-center">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="w-6 h-3 rounded bg-purple-200" />
              <div className="w-6 h-3 rounded bg-purple-300" />
              <div className="w-6 h-3 rounded bg-purple-400" />
              <div className="w-6 h-3 rounded bg-purple-500" />
              <div className="w-6 h-3 rounded bg-purple-600" />
              <span className="text-xs text-muted-foreground">High</span>
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
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
