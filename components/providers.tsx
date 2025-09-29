"use client";

import React, { useState } from "react";
import { AppKitProvider, wagmiAdapter } from "@/lib/appkit-config";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <SessionProvider>
          <AppKitProvider>
            {children}
          </AppKitProvider>
        </SessionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
