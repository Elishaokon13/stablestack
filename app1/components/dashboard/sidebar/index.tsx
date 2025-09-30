"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AtomIcon from "@/components/icons/atom";
import BracketsIcon from "@/components/icons/brackets";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import DotsVerticalIcon from "@/components/icons/dots-vertical";
import { Package, Wallet, CreditCard } from "lucide-react";
import { Bullet } from "@/components/ui/bullet";
import LockIcon from "@/components/icons/lock";
import Image from "next/image";
import { useIsV0 } from "@/lib/v0-context";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

// This is sample data for the sidebar
const getSidebarData = (currentPath: string) => ({
  navMain: [
    {
      title: "Tools",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: BracketsIcon,
          isActive: currentPath === "/dashboard",
        },
        {
          title: "Products",
          url: "/products",
          icon: Package,
          isActive: currentPath.startsWith("/products"),
        },
        // {
        //   title: "Wallet Test",
        //   url: "/test-wallet",
        //   icon: Wallet,
        //   isActive: currentPath.startsWith("/test-wallet"),
        // },
        {
          title: "Payment Flow",
          url: "/payment-flow",
          icon: CreditCard,
          isActive: currentPath.startsWith("/payment-flow"),
        },
        // {
        //   title: "Laboratory",
        //   url: "/laboratory",
        //   icon: AtomIcon,
        //   isActive: currentPath.startsWith("/laboratory"),
        // },
        // {
        //   title: "Devices",
        //   url: "/devices",
        //   icon: ProcessorIcon,
        //   isActive: currentPath.startsWith("/devices"),
        // },
        // {
        //   title: "Security",
        //   url: "/security",
        //   icon: CuteRobotIcon,
        //   isActive: currentPath.startsWith("/security"),
        // },
        // {
        //   title: "Communication",
        //   url: "/communication",
        //   icon: EmailIcon,
        //   isActive: currentPath.startsWith("/communication"),
        // },
        // {
        //   title: "Admin Settings",
        //   url: "/admin",
        //   icon: GearIcon,
        //   isActive: currentPath.startsWith("/admin"),
        //   locked: true,
        // },
      ],
    },
  ],
});

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const pathname = usePathname();
  const data = getSidebarData(pathname);
  const { isAuthenticated, address } = useAuth();

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">Paystack</span>
          <span className="text-xs uppercase">for Web3</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup
            className={cn(i === 0 && "rounded-t-none")}
            key={group.title}
          >
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      item.locked && "pointer-events-none opacity-50",
                      isV0 && "pointer-events-none"
                    )}
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild={!item.locked}
                      isActive={item.isActive}
                      disabled={item.locked}
                      className={cn(
                        "disabled:cursor-not-allowed",
                        item.locked && "pointer-events-none"
                      )}
                    >
                      {item.locked ? (
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            {isAuthenticated && address ? (
              <div className="p-3 space-y-3">
                {/* Disconnect Button */}
                <div className="pt-2">
                  <WalletConnectButton />
                </div>
              </div>
            ) : (
              <div className="p-3">
                <WalletConnectButton />
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
