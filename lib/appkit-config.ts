import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, baseSepolia } from "@reown/appkit/networks";
import { siweConfig } from "./siwe-config";
import { cookieStorage, createStorage } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Create Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks: [mainnet, sepolia],
  projectId,
});

// Set up metadata
const metadata = {
  name: "Paystack for Web3",
  description: "The ultimate payment platform for Web3. Accept card payments, receive USDC in your wallet.",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"]
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true,
  },
  siweConfig: siweConfig,
});

// Export the wagmi adapter for use in providers
export { wagmiAdapter };
