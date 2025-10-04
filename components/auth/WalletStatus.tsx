"use client"

import React from "react"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletStatusProps {
  showLabel?: boolean
  className?: string
}

export function WalletStatus({ showLabel = true, className = "" }: WalletStatusProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <Button
        disabled
        variant="ghost"
        size="sm"
        className="h-8 px-3 opacity-60"
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
          color: 'white'
        }}
      >
        <Wallet className="w-3 h-3 mr-2" />
        <span className="text-sm font-medium">Wallet Disabled</span>
      </Button>
    </motion.div>
  )
}
