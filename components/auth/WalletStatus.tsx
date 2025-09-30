"use client"

import React from "react"
import { useAccount } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { motion } from "framer-motion"
import { CheckCircle2, Wallet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletStatusProps {
  showLabel?: boolean
  className?: string
}

export function WalletStatus({ showLabel = true, className = "" }: WalletStatusProps) {
  const { address, isConnected, isConnecting } = useAccount()
  const { open } = useAppKit() as { open: () => void }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnecting) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        {showLabel && <span className="text-sm text-muted-foreground">Connecting...</span>}
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 ${className}`}
      >
        <Button
          onClick={open}
          variant="ghost"
          size="sm"
          className="h-8 px-3 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20"
        >
          <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <Button
        onClick={open}
        variant="ghost"
        size="sm"
        className="h-8 px-3 cursor-pointer"
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
          color: 'white'
        }}
      >
        <Wallet className="w-3 h-3 mr-2" />
        <span className="text-sm font-medium">Connect</span>
      </Button>
    </motion.div>
  )
}
