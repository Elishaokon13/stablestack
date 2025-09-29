import { createAppKit } from "@reown/appkit/react";
import { siweConfig } from "./siwe-config";

// Define networks manually
const mainnet = { id: 1, name: "Ethereum", currency: "ETH" };
const sepolia = { id: 11155111, name: "Sepolia", currency: "ETH" };
const arbitrum = { id: 42161, name: "Arbitrum One", currency: "ETH" };
const polygon = { id: 137, name: "Polygon", currency: "MATIC" };

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Create the AppKit instance
export const appKit = createAppKit({
  projectId,
  networks: [mainnet, sepolia, arbitrum, polygon],
  defaultNetwork: mainnet,
  features: {
    analytics: true,
  },
  siweConfig: siweConfig,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "hsl(var(--primary))",
    "--w3m-accent-foreground": "hsl(var(--primary-foreground))",
    "--w3m-background": "hsl(var(--background))",
    "--w3m-foreground": "hsl(var(--foreground))",
    "--w3m-border": "hsl(var(--border))",
    "--w3m-border-radius": "0.625rem",
  },
});

export default appKit;
