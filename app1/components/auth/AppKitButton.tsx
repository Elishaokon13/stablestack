"use client"

import React from "react"
import { useAppKit } from "@reown/appkit/react"
import { useAccount, useDisconnect } from "wagmi"
import { motion } from "framer-motion"
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppKitButtonProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  showAddress?: boolean
  showDisconnect?: boolean
}

export function AppKitButton({ 
  size = "lg", 
  variant = "default", 
  className = "",
  showAddress = true,
  showDisconnect = true
}: AppKitButtonProps) {
  const { open, close } = useAppKit()
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  // If connected, show the AppKit button that opens the modal
  if (isConnected && address) {
    return (
      <Button
        onClick={handleConnect}
        size={size}
        variant={variant}
        className={`w-full ${className}`}
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
        }}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        {formatAddress(address)}
      </Button>
    )
  }

  // If connecting
  if (isConnecting) {
    return (
      <Button
        disabled
        size={size}
        variant={variant}
        className={`w-full ${className}`}
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
        }}
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  // Default connect state
  return (
    <Button
      onClick={handleConnect}
      size={size}
      variant={variant}
      className={`w-full ${className}`}
      style={{ 
        background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
      }}
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  )
}

// Compact version for smaller spaces
export function AppKitButtonCompact({ className = "" }: { className?: string }) {
  return (
    <AppKitButton 
      size="sm" 
      variant="outline" 
      className={className}
      showAddress={false}
      showDisconnect={false}
    />
  )
}

// Full featured version for main pages
export function AppKitButtonFull({ className = "" }: { className?: string }) {
  return (
    <AppKitButton 
      size="lg" 
      variant="default" 
      className={className}
      showAddress={true}
      showDisconnect={true}
    />
  )
}
