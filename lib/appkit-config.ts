import { createAppKit } from "@reown/appkit/react";
import { siweConfig } from "./siwe-config";

// Define networks manually with proper format
const mainnet = { 
  id: 1, 
  name: "Ethereum", 
  currency: "ETH",
  rpcUrl: "https://rpc.ankr.com/eth",
  blockExplorerUrl: "https://etherscan.io"
};
const sepolia = { 
  id: 11155111, 
  name: "Sepolia", 
  currency: "ETH",
  rpcUrl: "https://rpc.ankr.com/eth_sepolia",
  blockExplorerUrl: "https://sepolia.etherscan.io"
};
const arbitrum = { 
  id: 42161, 
  name: "Arbitrum One", 
  currency: "ETH",
  rpcUrl: "https://rpc.ankr.com/arbitrum",
  blockExplorerUrl: "https://arbiscan.io"
};
const polygon = { 
  id: 137, 
  name: "Polygon", 
  currency: "MATIC",
  rpcUrl: "https://rpc.ankr.com/polygon",
  blockExplorerUrl: "https://polygonscan.com"
};

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "development-project-id";

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
