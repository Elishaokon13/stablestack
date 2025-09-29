import { createAppKit } from "@reown/appkit/react";
import { siweConfig } from "./siwe-config";

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "development-project-id";

// Create the AppKit instance with minimal configuration
export const appKit = createAppKit({
  projectId,
  features: {
    analytics: false,
  },
  siweConfig: siweConfig,
  themeMode: "dark",
});

export default appKit;
