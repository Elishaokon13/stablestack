"use client";

import React from "react";
import { ResponsiveLayoutWrapper } from "@/components/dashboard/layout/responsive-wrapper";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayoutWrapper>{children}</ResponsiveLayoutWrapper>;
}
