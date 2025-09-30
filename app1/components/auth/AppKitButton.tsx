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
  const { open, close } = useAppKit() as { open: () => void; close: () => void }
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
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={handleConnect}
          size={size}
          variant={variant}
          className={`w-full ${className} cursor-pointer`}
          style={{ 
            background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
            boxShadow: '0 4px 12px rgba(255, 89, 65, 0.3)'
          }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {formatAddress(address)}
          <span className="ml-2 text-xs opacity-75">Click to manage</span>
        </Button>
      </motion.div>
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
  const { open } = useAppKit()
  const { address, isConnected, isConnecting } = useAccount()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={open}
          size="sm"
          variant="outline"
          className={`${className} cursor-pointer`}
          style={{ 
            background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
            color: 'white',
            border: 'none'
          }}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {formatAddress(address)}
        </Button>
      </motion.div>
    )
  }

  if (isConnecting) {
    return (
      <Button
        disabled
        size="sm"
        variant="outline"
        className={className}
      >
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Connecting...
      </Button>
    )
  }

  return (
    <Button
      onClick={open}
      size="sm"
      variant="outline"
      className={className}
      style={{ 
        background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
        color: 'white',
        border: 'none'
      }}
    >
      <Wallet className="w-3 h-3 mr-1" />
      Connect
    </Button>
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
