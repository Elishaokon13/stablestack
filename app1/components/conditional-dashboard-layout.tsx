"use client";
import React from "react";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import { MobileHeader } from "./dashboard/mobile-header";
import { DashboardSidebar } from "./dashboard/sidebar";
import Widget from "./dashboard/widget";
import Notifications from "./dashboard/notifications";
import { MobileChat } from "./chat/mobile-chat";
import Chat from "./chat";
import type { MockData } from "../types/dashboard";

interface ConditionalDashboardLayoutProps {
  children: React.ReactNode;
  mockData: MockData;
}

export function ConditionalDashboardLayout({
  children,
  mockData,
}: ConditionalDashboardLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Show dashboard layout only for authenticated users on dashboard routes and products
  const shouldShowDashboardLayout =
    isAuthenticated &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/test-wallet") ||
      pathname.startsWith("/payment-flow"));

  if (shouldShowDashboardLayout) {
    return (
      <SidebarProvider>
        {/* Mobile Header - only visible on mobile */}
        <MobileHeader mockData={mockData} />

        {/* Desktop Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
          <div className="hidden lg:block col-span-2 top-0 relative">
            <DashboardSidebar />
          </div>
          <div className="col-span-1 lg:col-span-7">{children}</div>
          <div className="col-span-3 hidden lg:block">
            <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
              <Notifications initialNotifications={mockData.notifications} />
              <Chat />
            </div>
          </div>
        </div>

        {/* Mobile Chat - floating CTA with drawer */}
        <MobileChat />
      </SidebarProvider>
    );
  }

  // For auth pages and other routes, show simple layout
  return <>{children}</>;
}
