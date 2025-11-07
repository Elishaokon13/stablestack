"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { TbLayoutGridFilled, TbLink } from "react-icons/tb";
import { PiListFill } from "react-icons/pi";
import { IoWallet } from "react-icons/io5";
import { FaChartPie } from "react-icons/fa";
import Link from "next/link";

const getNavItems = (pathname: string) => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: TbLayoutGridFilled,
    isActive: pathname === "/dashboard",
  },
  {
    title: "Links",
    url: "/links",
    icon: TbLink,
    isActive: pathname === "/links",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: PiListFill,
    isActive: pathname === "/transactions",
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: IoWallet,
    isActive: pathname === "/wallet",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: FaChartPie,
    isActive: pathname === "/analytics",
  },
];

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
        " w-[240px] !sticky top-0 border-r border-r-white/10 h-screen flex flex-col justify-between bg-[#0f0f0f]",
        className
      )}
    >
      <div className="py-5 px-3 flex items-center gap-2 border-b border-b-white/10 h-[70px]">
        <div
          className={`w-full h-full px-4 py-3 flex items-center justify-left`}
        >
          <img src="/openly-logo.svg" alt="" className="w-24" />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full px-4 py-3">
        {navMain.map((item) => {
          const isActive = Boolean(item.isActive);

          return (
            <SidebarMenuItem
              key={item.title}
              className={cn("flex items-center justify-center")}
            >
              <SidebarMenuButton
                isActive={isActive}
                className={cn(
                  "flex items-center w-full text-white/60 px-2 md:px-3 text-sm font-light rounded-[8px] hover:opacity-60 active:opacity-50 transition-opacity",
                  isActive && "bg-primary text-white"
                )}
              >
                <Link
                  href={item.url}
                  onClick={handleNavClick}
                  className="flex items-center gap-2 md:gap-3 w-full min-w-0"
                >
                  <item.icon className="size-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </div>

      {/* Simple Footer */}
      <SidebarFooter className="mt-auto px-4 py-3 md:py-4 border-t border-white/10">
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
