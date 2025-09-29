"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useUserSession } from "@/hooks/useUserSession"
import { Wallet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export function WalletAuth() {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet, 
    address 
  } = useUserSession()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isAuthenticated && address) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success State */}
        <div className="text-center">
          <motion.div 
            className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: '#d1fae5' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-6 h-6" style={{ color: '#059669' }} />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#065f46' }}>
            Wallet Connected
          </h3>
          <p className="text-sm mb-4" style={{ color: '#047857' }}>
            {formatAddress(address)}
          </p>
        </div>

        {/* Disconnect Button */}
        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error State */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#fee2e2' }}>
            <AlertCircle className="w-6 h-6" style={{ color: '#dc2626' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#92400e' }}>
            Connection Failed
          </h3>
          <p className="text-sm mb-4" style={{ color: '#b45309' }}>
            {error}
          </p>
        </div>

        {/* Retry Button */}
        <Button
          onClick={connectWallet}
          disabled={isLoading}
          size="lg"
          className="w-full"
          style={{ 
            background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </motion.div>
    )
  }

  // Default connect state
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f8f8f8' }}>
          <Wallet className="w-8 h-8" style={{ color: '#ff5941' }} />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>
          Connect Your Wallet
        </h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
          Connect your wallet to access the M.O.N.K.Y OS payment system
        </p>
      </div>

      <Button
        onClick={connectWallet}
        disabled={isLoading}
        size="lg"
        className="w-full"
        style={{ 
          background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs" style={{ color: '#9ca3af' }}>
          Powered by Reown • Secure • Global
        </p>
      </div>
    </motion.div>
  )
}
