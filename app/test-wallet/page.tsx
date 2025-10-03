"use client";

import React from "react";
import { WalletAuth } from "@/components/auth";
import DashboardPageLayout from "@/components/dashboard/layout";
import { WalletIcon } from "lucide-react";

export default function TestWalletPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Stablestack Wallet Test",
        description: "Test Reown embedded wallet integration",
        icon: WalletIcon,
      }}
    >
      <WalletAuth />
    </DashboardPageLayout>
  );
}
