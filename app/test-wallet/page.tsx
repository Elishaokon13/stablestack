"use client";

import { useSession } from "next-auth/react";
import { useAppKit } from "@reown/appkit/react";
import WalletConnect from "@/components/wallet/wallet-connect";

export default function TestWalletPage() {
  const { data: session, status } = useSession();
  const { isConnected, address, chainId } = useAppKit();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Wallet Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Session Status</h2>
            <div className="p-4 bg-muted rounded-lg">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Address:</strong> {session?.address || "Not connected"}</p>
              <p><strong>Chain ID:</strong> {session?.chainId || "Not connected"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">AppKit Status</h2>
            <div className="p-4 bg-muted rounded-lg">
              <p><strong>Connected:</strong> {isConnected ? "Yes" : "No"}</p>
              <p><strong>Address:</strong> {address || "Not connected"}</p>
              <p><strong>Chain ID:</strong> {chainId || "Not connected"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Wallet Connect Component</h2>
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
