"use client";

import { useSession, signOut } from "next-auth/react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Wallet, 
  LogOut, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WalletConnectProps {
  className?: string;
}

export default function WalletConnect({ className }: WalletConnectProps) {
  const { data: session, status } = useSession();
  const { open, isConnected, address, chainId } = useAppKit();
  const [copied, setCopied] = useState(false);

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

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 11155111: return "Sepolia";
      case 42161: return "Arbitrum";
      case 137: return "Polygon";
      default: return "Unknown";
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

  if (status === "loading") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
        <div className="w-20 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!session || !isConnected) {
    return (
      <Button
        onClick={open}
        className={cn("gap-2", className)}
        variant="default"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2 h-auto p-2", className)}
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getChainColor(chainId))} />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {formatAddress(address || "")}
              </span>
              <span className="text-xs text-muted-foreground">
                {getChainName(chainId)}
              </span>
            </div>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-2 h-2 rounded-full", getChainColor(chainId))} />
            <span className="text-sm font-medium">Connected</span>
            <Badge variant="outline" className="text-xs">
              {getChainName(chainId)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-xs font-mono flex-1">
              {address}
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View on Etherscan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
