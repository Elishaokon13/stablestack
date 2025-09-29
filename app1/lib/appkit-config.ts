import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, baseSepolia, mainnet, sepolia } from "@reown/appkit/networks";
import { siweConfig } from "./siwe-config";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Create Wagmi adapter with embedded wallet support
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base, baseSepolia, mainnet, sepolia] as any,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// Set up metadata for M.O.N.K.Y OS theme
const metadata = {
  name: "M.O.N.K.Y OS - Web3 Payments",
  description: "The ultimate rebel payment platform for Web3. Accept USDC payments with style.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  icons: ["/placeholder-logo.svg"] // Using our app1 logo
};

// Create the AppKit with embedded wallet support
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, baseSepolia, mainnet, sepolia] as any,
  defaultNetwork: base as any,
  metadata: metadata,
  features: {
    analytics: true,
    email: true, // Enable email login for embedded wallets
    socials: ['google', 'x', 'github'], // Social login options
    emailShowWallets: true, // Show wallet options in email flow
  },
  siweConfig: siweConfig,
  themeMode: 'dark', // Match our rebel/cyberpunk theme
  themeVariables: {
    '--w3m-color-mix': '#ff5941', // Our signature orange color
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px', // Match our rounded corners
  },
});

// Export the wagmi adapter for use in providers
export { wagmiAdapter };
