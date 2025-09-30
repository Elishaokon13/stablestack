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

  // If connected and showing address
  if (isConnected && address && showAddress) {
    return (
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.div 
            className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: '#d1fae5' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: '#059669' }} />
          </motion.div>
          <p className="text-sm font-medium" style={{ color: '#065f46' }}>
            {formatAddress(address)}
          </p>
        </div>
        
        {showDisconnect && (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size={size}
            className={`w-full ${className}`}
          >
            Disconnect
          </Button>
        )}
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
