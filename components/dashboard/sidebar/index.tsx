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
    title: "Products",
    url: "/products",
    icon: Package,
    isActive: pathname === "/products",
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
    isActive: pathname === "/payments",
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

  return (
    <Sidebar
      {...props}
      className={cn("h-screen border-r border-white/10 bg-sidebar", className)}
    >
      {/* Simple Logo Header */}
      <SidebarHeader className="py-4 px-3 border-b border-white/10 ">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <MonkeyIcon className="size-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display text-sidebar-foreground">
              Openly
            </span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Web3 Payments
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="">
        <SidebarGroup className="border-b border-white/10 pb-3 mb-0 last:border-b-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 pr-3">
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
                        "w-[5px] h-[50px] rounded-r-lg",
                        isActive && "bg-primary"
                      )}
                    />

                    <SidebarMenuButton
                      asChild={!isLocked}
                      isActive={isActive}
                      className={cn(
                        "flex items-center w-full h-[50px] px-3 ml-2 text-sm font-light rounded-lg hover:opacity-60 transition-opacity",
                        isActive && "bg-primary text-white"
                      )}
                    >
                      {isLocked ? (
                        <div className="flex items-center gap-3">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <a
                          href={item.url}
                          className="flex items-center gap-3 w-full"
                        >
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
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
      <SidebarFooter className="mt-auto p-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName || user?.username || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
