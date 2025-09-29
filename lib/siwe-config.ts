import { getCsrfToken, signIn, signOut, getSession } from "next-auth/react";
import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
  SIWESession,
} from "@reown/appkit-siwe";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";

// Import networks - we'll define them manually since the package import is having issues
const mainnet = { id: 1, name: "Ethereum", currency: "ETH" };
const sepolia = { id: 11155111, name: "Sepolia", currency: "ETH" };
const arbitrum = { id: 42161, name: "Arbitrum One", currency: "ETH" };
const polygon = { id: 137, name: "Polygon", currency: "MATIC" };

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: [mainnet.id, sepolia.id, arbitrum.id, polygon.id],
    statement: "Sign in to Paystack for Web3 - The bridge between traditional finance and Web3",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) {
      throw new Error("Failed to get nonce!");
    }
    return nonce;
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Validate address and chainId types
    if (
      typeof (session as any).address !== "string" ||
      typeof (session as any).chainId !== "number"
    ) {
      return null;
    }

    return {
      address: (session as any).address,
      chainId: (session as any).chainId,
    } satisfies SIWESession;
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: false,
        signature,
        callbackUrl: "/dashboard",
      });

      return Boolean(success?.ok);
    } catch (error) {
      console.error("SIWE verification error:", error);
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false,
      });
      return true;
    } catch (error) {
      console.error("SIWE sign out error:", error);
      return false;
    }
  },
});

// Export networks for use in AppKit
export const networks = [mainnet, sepolia, arbitrum, polygon];
