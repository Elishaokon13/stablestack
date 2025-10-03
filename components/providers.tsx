"use client";

import React, { useState } from "react";
import { wagmiAdapter } from "@/lib/appkit-config";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState } from "wagmi";
import { AppKitProvider } from "@reown/appkit/react";

export function Providers({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);

  return (
    <QueryClientProvider client={queryClient}>
      {/* <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}> */}
      {/* <AppKitProvider> */}
      <SessionProvider>{children}</SessionProvider>
      {/* </AppKitProvider> */}
      {/* </WagmiProvider> */}
    </QueryClientProvider>
  );
}
