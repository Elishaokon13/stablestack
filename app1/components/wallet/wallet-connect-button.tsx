"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useSession, signOut } from "next-auth/react";
import { formatAddress } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function WalletConnectButton() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectWallet, isAuthenticated } = useAuth();

  const handleDisconnect = async () => {
    await signOut();
    disconnect();
  };

  if (isAuthenticated && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent/50 border border-white/20 rounded-xl backdrop-blur-sm">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">
            {formatAddress(address || "")}
          </span>
        </div>
        <button
          className="px-4 py-3 text-sm font-medium text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]"
    >
      <Wallet className="w-5 h-5 mr-3" />
      Connect Wallet
    </button>
  );
}
