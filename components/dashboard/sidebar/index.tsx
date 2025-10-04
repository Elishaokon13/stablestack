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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import { Package, CreditCard, BarChart3, TestTube } from "lucide-react";
import { Bullet } from "@/components/ui/bullet";
import LockIcon from "@/components/icons/lock";
import { useIsV0 } from "@/lib/v0-context";

const getNavItems = (pathname: string) => [
  {
    title: "Payment System",
    items: [
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
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        isActive: pathname === "/analytics",
      },
    ],
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

  return (
    <Sidebar {...props} className={cn("py-sides h-screen", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">Stablestack</span>
          <span className="text-xs uppercase">Web3 Payments</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group, i) => (
          <SidebarGroup
            className={cn(i === 0 && "rounded-t-none")}
            key={group.title}
          >
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isLocked = "locked" in item && item.locked;
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(
                        isLocked ? "pointer-events-none opacity-50" : "",
                        isV0 && "pointer-events-none"
                      )}
                      data-disabled={isLocked}
                    >
                      <SidebarMenuButton
                        asChild={!isLocked}
                        isActive={Boolean(item.isActive)}
                        disabled={isLocked ? true : false}
                        className={cn(
                          "disabled:cursor-not-allowed",
                          isLocked ? "pointer-events-none" : ""
                        )}
                      >
                        {isLocked ? (
                          <div className="flex items-center gap-3 w-full">
                            <item.icon className="size-5" />
                            <span>{item.title}</span>
                          </div>
                        ) : (
                          <a href={item.url}>
                            <item.icon className="size-5" />
                            <span>{item.title}</span>
                          </a>
                        )}
                      </SidebarMenuButton>
                      {isLocked ? (
                        <SidebarMenuBadge>
                          <LockIcon className="size-5 block" />
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
