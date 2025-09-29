"use client";

import React, { useState } from "react";
import { AppKitProvider, wagmiAdapter } from "@/lib/appkit-config";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState } from "wagmi";

export function Providers({ 
  children, 
  cookies 
}: { 
  children: React.ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
        <SessionProvider>
          <AppKitProvider>
            {children}
          </AppKitProvider>
        </SessionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
