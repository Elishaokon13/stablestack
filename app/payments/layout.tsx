"use client";

import React from "react";
import { ResponsiveLayoutWrapper } from "@/components/dashboard/layout/responsive-wrapper";

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayoutWrapper>{children}</ResponsiveLayoutWrapper>;
}
