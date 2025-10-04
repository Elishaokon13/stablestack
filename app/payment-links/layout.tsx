"use client";

import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function PaymentLinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:px-6">
        <div className="hidden lg:block col-span-2 top-0 relative">
          <DashboardSidebar />
        </div>
        <div className="col-span-1 lg:col-span-10 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
