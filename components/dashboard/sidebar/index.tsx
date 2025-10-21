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
  const { user } = useUser();

  return (
    <Sidebar {...props} className={cn("h-screen", className)}>
      {/* Enhanced Header with gradient background */}
      <SidebarHeader className="flex gap-3 flex-row relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/5 via-transparent to-sidebar-primary/5 opacity-50" />

        <motion.div
          className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/5 transition-all duration-300 group-hover:from-sidebar-primary group-hover:to-sidebar-primary/80 text-sidebar-primary-foreground relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MonkeyIcon className="size-10 group-hover:scale-110 origin-center transition-transform duration-300" />
          <motion.div
            className="absolute inset-0 rounded-lg bg-sidebar-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <div className="grid flex-1 text-left text-sm leading-tight relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text">
              Stablestack
            </span>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="size-3.5 text-sidebar-primary opacity-60" />
            </motion.div>
          </div>
          <span className="text-xs uppercase tracking-wider text-sidebar-foreground/60 font-medium">
            Web3 Payments
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group, i) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Bullet className="mr-1" />
              <span className="tracking-wide">{group.title}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, index) => {
                  const isLocked = "locked" in item && item.locked;
                  const isActive = Boolean(item.isActive);

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SidebarMenuItem
                        className={cn(
                          isLocked ? "pointer-events-none opacity-50" : "",
                          isV0 && "pointer-events-none",
                          "relative"
                        )}
                        data-disabled={isLocked}
                      >
                        {/* Active indicator bar */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full"
                              initial={{ scaleY: 0, opacity: 0 }}
                              animate={{ scaleY: 1, opacity: 1 }}
                              exit={{ scaleY: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </AnimatePresence>

                        <SidebarMenuButton
                          asChild={!isLocked}
                          isActive={isActive}
                          disabled={isLocked ? true : false}
                          className={cn(
                            "disabled:cursor-not-allowed transition-all duration-200 relative",
                            isLocked ? "pointer-events-none" : "",
                            isActive && "shadow-sm",
                            "hover:translate-x-0.5"
                          )}
                        >
                          {isLocked ? (
                            <div className="flex items-center gap-3 w-full">
                              <item.icon className="size-5 transition-transform group-hover:scale-110" />
                              <span className="font-medium">{item.title}</span>
                            </div>
                          ) : (
                            <a href={item.url}>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <item.icon className="size-5" />
                              </motion.div>
                              <span className="font-medium">{item.title}</span>

                              {/* Subtle shine effect on hover */}
                              {isActive && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-sidebar-foreground/5 to-transparent rounded"
                                  initial={{ x: "-100%" }}
                                  whileHover={{ x: "100%" }}
                                  transition={{ duration: 0.6 }}
                                />
                              )}
                            </a>
                          )}
                        </SidebarMenuButton>

                        {isLocked ? (
                          <SidebarMenuBadge className="opacity-70">
                            <LockIcon className="size-4 block" />
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Enhanced Footer with user info */}
      <SidebarFooter className="mt-auto border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors duration-200">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-sidebar-primary/20 hover:ring-sidebar-primary/40 transition-all",
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

        {/* Version badge */}
        <div className="px-2 py-1 text-center">
          <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wider font-medium">
            Version 1.0.0
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
