"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

interface User {
  address: string;
  email?: string;
  name?: string;
  isOnboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  address: string | undefined;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<User | null>;
  refreshUser: () => void;
  setUser: (user: User | null) => void;
  authCredentials: {
    address: string;
  };
  hasAuthCredentials: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status: sessionStatus } = useSession();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine overall loading state
  const isLoading = sessionStatus === 'loading' || isConnecting;

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setError(null);
      await open();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Wallet connection error:', err);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnect();
      setUser(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMsg);
      console.error('Wallet disconnection error:', err);
    }
  };

  // Update user function
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return null;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMsg);
      throw err;
    }
  };

  // Refresh user function
  const refreshUser = () => {
    setUser(prev => prev ? { ...prev } : null);
  };

  // Update user state when wallet connects/disconnects or session changes
  useEffect(() => {
    if (isConnected && address) {
      setUser({
        address,
        isOnboardingComplete: false, // New users need onboarding
      });
    } else if (!isConnected && !session?.address) {
      setUser(null);
    }
  }, [isConnected, address, session?.address]);

  // Check authentication status
  const isAuthenticated = (isConnected && !!address) || !!session?.address;
  const needsOnboarding = !!(user && !user.isOnboardingComplete);

  const contextValue: AuthContextType = {
    user,
    address: address || session?.address,
    isLoading,
    error,
    isAuthenticated,
    needsOnboarding,
    connectWallet,
    disconnectWallet,
    updateUser,
    refreshUser,
    setUser,
    authCredentials: {
      address: address || session?.address || '',
    },
    hasAuthCredentials: !!(address || session?.address),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
