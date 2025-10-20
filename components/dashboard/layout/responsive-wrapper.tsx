"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { UniqueNameModal } from "@/components/auth/unique-name-modal";

interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode;
  showUniqueNameModal?: boolean;
}

export function ResponsiveLayoutWrapper({
  children,
  showUniqueNameModal = false,
}: ResponsiveLayoutWrapperProps) {
  return (
    <SidebarProvider>
      {showUniqueNameModal && <UniqueNameModal />}
      
      {/* Mobile Header */}
      <MobileHeader />

      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

