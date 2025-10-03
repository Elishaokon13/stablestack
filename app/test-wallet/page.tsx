"use client";

import React from "react";
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
      <div className="flex flex-col items-center justify-center h-full"></div>
    </DashboardPageLayout>
  );
}
