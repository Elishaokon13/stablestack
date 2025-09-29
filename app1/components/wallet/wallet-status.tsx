"use client";

import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function WalletStatus() {
  const { data: session, status } = useSession();
  const { address, isConnected, chainId } = useAccount();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isConnected || !session) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm text-muted-foreground">Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {formatAddress(address || "")}
        </span>
        <Badge variant="outline" className="text-xs">
          Chain {chainId}
        </Badge>
      </div>
    </div>
  );
}
