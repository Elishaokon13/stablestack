"use client";

import { useAppKit } from "@/lib/appkit-config";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";

export function WalletConnectButton() {
  const appKit = useAppKit();
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  console.log('AppKit hook result:', appKit);

  if (!appKit) {
    return <div>Loading...</div>;
  }

  const { open } = appKit;

  const handleConnect = () => {
    open();
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      <div className="w-2 h-2 bg-primary rounded-full"></div>
      Connect Wallet
    </Button>
  );
}
