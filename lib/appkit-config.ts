import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { siweConfig } from "./siwe-config";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Create the modal
export const appKit = createAppKit({
  adapters: [WagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: mainnet,
  features: {
    analytics: true,
  },
  siweConfig: siweConfig,
});

export const { AppKitProvider, useAppKit } = appKit;
