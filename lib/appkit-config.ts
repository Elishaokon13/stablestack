import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks: [mainnet, sepolia],
  projectId,
});

// Debug: Log the project ID
console.log('Project ID:', projectId);

// Create the modal with minimal configuration
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: mainnet,
});

// Debug: Log the appKit object
console.log('AppKit object:', appKit);
console.log('AppKitProvider:', appKit.AppKitProvider);
console.log('useAppKit:', appKit.useAppKit);

// Export the providers and hooks
export const { AppKitProvider, useAppKit } = appKit;
