"use client";

import { useSession } from "next-auth/react";
import { useAppKit } from "@reown/appkit/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WalletStatusProps {
  className?: string;
}

export default function WalletStatus({ className }: WalletStatusProps) {
  const { data: session, status } = useSession();
  const { isConnected, address, chainId, open } = useAppKit();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 42161: return "Arbitrum One";
      case 137: return "Polygon";
      default: return "Unknown Network";
    }
  };

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case 1: return "bg-blue-500";
      case 11155111: return "bg-purple-500";
      case 42161: return "bg-cyan-500";
      case 137: return "bg-violet-500";
      default: return "bg-gray-500";
    }
  };

  const getExplorerUrl = (chainId: number, address: string) => {
    switch (chainId) {
      case 1: return `https://etherscan.io/address/${address}`;
      case 11155111: return `https://sepolia.etherscan.io/address/${address}`;
      case 42161: return `https://arbiscan.io/address/${address}`;
      case 137: return `https://polygonscan.com/address/${address}`;
      default: return `https://etherscan.io/address/${address}`;
    }
  };

  if (status === "loading") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full h-4 bg-muted animate-pulse rounded" />
            <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session || !isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No wallet connected
              </p>
            </div>
            <Button onClick={open} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Status
          <CheckCircle className="w-4 h-4 text-success" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getChainColor(chainId))} />
            <Badge variant="outline">
              {getChainName(chainId)}
            </Badge>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Address</span>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-xs font-mono flex-1">
              {formatAddress(address || "")}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(address || "")}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Balance</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono">
              {balance || "Loading..."}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLoading(true)}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(getExplorerUrl(chainId, address || ""), '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Explorer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={open}
            className="flex-1"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Switch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
