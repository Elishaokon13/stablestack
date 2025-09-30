"use client";
import React from "react";
import { useAuth } from "@/lib/auth-context";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { isAuthenticated, isLoading, connectWallet } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-white mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <p className="text-white">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to StableStack
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connect your wallet to access the Web3 payment dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <WalletConnectButton />
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Connect your wallet to sign in with Ethereum</p>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Secure Web3 payments</li>
              <li>• Real-time dashboard</li>
              <li>• Wallet management</li>
              <li>• Transaction history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
