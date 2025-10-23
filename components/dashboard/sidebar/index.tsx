"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import MonkeyIcon from "@/components/icons/monkey";
import { Package, CreditCard, BarChart3, Wallet } from "lucide-react";
import { useIsV0 } from "@/lib/v0-context";
import { UserButton, useUser } from "@clerk/nextjs";

const getNavItems = (pathname: string) => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    isActive: pathname === "/dashboard",
  },
  {
    title: "Links",
    url: "/links",
    icon: Package,
    isActive: pathname === "/links",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
    isActive: pathname === "/transactions",
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
    isActive: pathname === "/wallet",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    isActive: pathname === "/analytics",
  },
  // {
  //   title: "Development",
  //   items: [
  //     {
  //       title: "Test Wallet",
  //       url: "/test-wallet",
  //       icon: TestTube,
  //       isActive: false,
  //     },
  //     {
  //       title: "API Docs",
  //       url: "/api-docs",
  //       icon: GearIcon,
  //       isActive: false,
  //     },
  //   ],
  // },
];

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const pathname = usePathname();
  const navMain = getNavItems(pathname);
  const { user } = useUser();
  const { setOpenMobile, isMobile } = useSidebar();

  // Close mobile sidebar on navigation
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      {...props}
      className={cn(
        "h-screen border-r border-white/10 bg-sidebar w-[280px]",
        className
      )}
    >
      {/* Simple Logo Header */}
      <SidebarHeader className="py-4 px-3 md:py-5 border-b border-white/10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center">
            <MonkeyIcon className="size-9 md:size-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-display text-sidebar-foreground">
              Openly
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Web3 Payments
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="border-b border-white/10 pb-3 mb-0 last:border-b-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 pr-2 md:pr-3">
              {navMain.map((item) => {
                const isLocked = "locked" in item && item.locked;
                const isActive = Boolean(item.isActive);

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn("flex", isV0 && "pointer-events-none")}
                  >
                    {/* Left indicator - only show when active */}
                    <div
                      className={cn(
                        "w-[5px] h-[50px] rounded-r-lg transition-colors",
                        isActive && "bg-primary"
                      )}
                    />

                    <SidebarMenuButton
                      asChild={!isLocked}
                      isActive={isActive}
                      className={cn(
                        "flex items-center w-full h-[50px] px-2 md:px-3 ml-2 text-sm font-light rounded-lg hover:opacity-60 active:opacity-50 transition-opacity",
                        isActive && "bg-primary text-white"
                      )}
                    >
                      {isLocked ? (
                        <div className="flex items-center gap-2 md:gap-3">
                          <item.icon className="size-5 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      ) : (
                        <a
                          href={item.url}
                          onClick={handleNavClick}
                          className="flex items-center gap-2 md:gap-3 w-full min-w-0"
                        >
                          <item.icon className="size-5 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Simple Footer */}
      <SidebarFooter className="mt-auto px-3 py-3 md:py-4 border-t border-white/10">
        <div className="flex items-center gap-2 md:gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 md:w-10 md:h-10",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName || user?.username || "User"}
            </p>
            <p className="text-[10px] md:text-xs text-sidebar-foreground/60 truncate">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
