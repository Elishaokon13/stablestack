"use client";

import React from "react";
import { AppKitButtonFull } from "./AppKitButton";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export function WalletAuth() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "#f8f8f8" }}
        >
          <Wallet className="w-8 h-8" style={{ color: "#ff5941" }} />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "#1a1a1a" }}>
          Connect Your Wallet
        </h3>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "#6b7280" }}
        >
          Connect your wallet to access the Stablestack payment system
        </p>
      </div>

      <AppKitButtonFull />

      <div className="text-center">
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          Powered by Reown • Secure • Global
        </p>
      </div>
    </motion.div>
  );
}
