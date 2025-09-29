"use client"

import { useEffect, useState, useCallback } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useAppKit } from "@reown/appkit/react"

export function useUserSession() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  
  const [user, setUser] = useState<{
    address: string
    email?: string
    name?: string
    isOnboardingComplete?: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await open()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMsg)
      console.error("Wallet connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [open])

  // Disconnect wallet function
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      setUser(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to disconnect wallet"
      setError(errorMsg)
      console.error("Wallet disconnection error:", err)
    }
  }, [disconnect])

  // Update user state when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && address) {
      setUser({
        address,
        isOnboardingComplete: false, // New users need onboarding
      })
      setIsLoading(false)
    } else if (!isConnected) {
      setUser(null)
      setIsLoading(false)
    }
  }, [isConnected, address])

  // Update loading state
  useEffect(() => {
    if (isConnecting) {
      setIsLoading(true)
    }
  }, [isConnecting])

  const updateUser = async (updates: { 
    name?: string
    email?: string
    isOnboardingComplete?: boolean 
  }) => {
    if (!user) return null

    try {
      setUser(prev => prev ? { ...prev, ...updates } : null)
      return user
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update user"
      setError(errorMsg)
      throw err
    }
  }

  const refreshUser = () => {
    // Trigger a re-render by updating state
    setUser(prev => prev ? { ...prev } : null)
  }

  return {
    user,
    address,
    isLoading,
    error,
    isAuthenticated: isConnected && !!address,
    needsOnboarding: !!(user && !user.isOnboardingComplete),
    connectWallet,
    disconnectWallet,
    updateUser,
    refreshUser,
    setUser,
    // Authentication credentials for API calls
    authCredentials: {
      address: address || '',
    },
    // Helper to check if user has valid auth credentials
    hasAuthCredentials: !!(address),
  }
}
