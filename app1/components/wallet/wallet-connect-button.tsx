"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useSession, signOut } from "next-auth/react";
import { formatAddress } from "@/lib/utils";

export function WalletConnectButton() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    await signOut();
    disconnect();
  };

  if (isConnected && session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">
            {formatAddress(address || "")}
          </span>
        </div>
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return <appkit-button />;
}
