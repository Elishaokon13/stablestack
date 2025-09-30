"use client"

import React from "react"
import { WalletAuth } from "@/components/auth"
import { useUserSession } from "@/hooks/useUserSession"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react"

export default function TestWalletPage() {
  const { 
    user, 
    address, 
    isAuthenticated, 
    isLoading, 
    error, 
    needsOnboarding 
  } = useUserSession()

  return (
    <DashboardPageLayout
      header={{
        title: "M.O.N.K.Y OS Wallet Test",
        description: "Test Reown embedded wallet integration",
        icon: Wallet,
      }}
    >
      <div className="space-y-8">
        {/* Status Card */}
        <Card className="ring-2 ring-pop">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge 
                variant="outline"
                className="px-3 py-1"
                style={{ 
                  backgroundColor: isAuthenticated ? '#d1fae5' : '#fee2e2',
                  borderColor: isAuthenticated ? '#059669' : '#dc2626',
                  color: isAuthenticated ? '#059669' : '#dc2626'
                }}
              >
                {isAuthenticated ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {address && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Address:</span>
                <code className="text-sm font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              </div>
            )}

            {needsOnboarding && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Onboarding required
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Auth Component */}
        <Card className="ring-2 ring-pop">
          <CardHeader>
            <CardTitle>
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WalletAuth />
          </CardContent>
        </Card>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="ring-2 ring-pop">
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto text-muted-foreground bg-muted p-4 rounded-lg">
                {JSON.stringify({
                  isAuthenticated,
                  isLoading,
                  hasAddress: !!address,
                  needsOnboarding,
                  hasError: !!error,
                  user: user ? {
                    address: user.address,
                    isOnboardingComplete: user.isOnboardingComplete
                  } : null
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  )
}
