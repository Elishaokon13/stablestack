"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiAdapter } from "@/lib/appkit-config"

// Create a client for React Query
const queryClient = new QueryClient()

export function ReownProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Validate environment variable on client side
    if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
      console.error("NEXT_PUBLIC_PROJECT_ID environment variable is not set")
    }
  }, [])

  // Prevent SSR issues by only rendering the provider on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ff5941' }}></div>
          <p className="text-muted-foreground" style={{ color: '#6b7280' }}>Initializing M.O.N.K.Y OS...</p>
        </div>
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiAdapter.config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
