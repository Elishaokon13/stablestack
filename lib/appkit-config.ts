import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, baseSepolia } from "@reown/appkit/networks";
import { siweConfig } from "./siwe-config";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  console.warn("NEXT_PUBLIC_PROJECT_ID is not set. Wallet connection will not work properly.");
  console.warn("Please set NEXT_PUBLIC_PROJECT_ID in your .env.local file");
}

// Only initialize if projectId is available
let wagmiAdapter: any = null;

if (projectId) {
  // Create Wagmi adapter with embedded wallet support
  wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [base, baseSepolia] as any,
    storage: createStorage({
      storage: cookieStorage,
    }),
  });

  // Set up metadata for M.O.N.K.Y OS theme
  const metadata = {
    name: "StableStack",
    description: "The ultimate rebel payment platform for Web3. Accept USDC payments with style.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    icons: ["/logo.png"] // Using our app1 logo
  };

  // Create the AppKit with full features like the demo
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [base, baseSepolia] as any,
    defaultNetwork: base as any,
    metadata: metadata,
    features: {
      email: true,
      socials: ['google', 'x', 'github'],
      emailShowWallets: false,
    },
    allWallets: "HIDE",
    siweConfig: siweConfig,
    themeMode: 'dark', // Match our rebel/cyberpunk theme
    themeVariables: {
      '--w3m-color-mix': '#ff5941', // Our signature orange color
      '--w3m-color-mix-strength': 20,
      '--w3m-border-radius-master': '12px', // Match our rounded corners
      '--w3m-font-family': "'__Noto_Sans_50a98f', '__Noto_Sans_Fallback_50a98f'",
    },
  });
}

// Export the wagmi adapter for use in providers
export { wagmiAdapter };
