"use client";

import { SessionProvider } from "next-auth/react";
import { AppKitProvider } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import appKit from "@/lib/appkit-config";

interface Web3ProviderProps {
  children: React.ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <AppKitProvider>
        <WagmiProvider config={appKit.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </AppKitProvider>
    </SessionProvider>
  );
}
