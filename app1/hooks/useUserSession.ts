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
    _id?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  console.log("useUserSession state:", { address, isConnected, isConnecting, isLoading, error })

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      setError(null)
      await open()
      // Don't set isLoading here - let the useEffect handle it based on isConnecting
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMsg)
      console.error("Wallet connection error:", err)
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

  // Fetch user data from database when wallet connects
  const fetchUserData = useCallback(async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/users?walletAddress=${walletAddress}`)
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser({
            address: walletAddress,
            email: data.user.email,
            name: data.user.username,
            isOnboardingComplete: data.user.isOnboardingComplete,
            _id: data.user._id, // Add _id for API calls
          })
        } else {
          // User doesn't exist in database yet
          setUser({
            address: walletAddress,
            isOnboardingComplete: false,
          })
        }
      } else {
        // User doesn't exist in database yet
        setUser({
          address: walletAddress,
          isOnboardingComplete: false,
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Fallback to default state
      setUser({
        address: walletAddress,
        isOnboardingComplete: false,
      })
    }
  }, [])

  // Update user state when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && address) {
      fetchUserData(address)
      setIsLoading(false)
    } else if (!isConnected) {
      setUser(null)
      setIsLoading(false)
    }
  }, [isConnected, address, fetchUserData])

  // Update loading state based on wagmi's isConnecting
  useEffect(() => {
    setIsLoading(isConnecting)
  }, [isConnecting])

  const updateUser = async (updates: { 
    name?: string
    email?: string
    isOnboardingComplete?: boolean 
  }) => {
    if (!user) return null

    try {
      setUser(prev => prev ? { ...prev, ...updates } : null)
      return { ...user, ...updates }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update user"
      setError(errorMsg)
      throw err
    }
  }

  const refreshUser = () => {
    // Refetch user data from database
    if (address) {
      fetchUserData(address)
    }
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
