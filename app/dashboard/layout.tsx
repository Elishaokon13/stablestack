"use client";

import React from "react";
import { ResponsiveLayoutWrapper } from "@/components/dashboard/layout/responsive-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayoutWrapper showUniqueNameModal={true}>
      {children}
    </ResponsiveLayoutWrapper>
  );
}
