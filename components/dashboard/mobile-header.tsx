"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import MonkeyIcon from "@/components/icons/monkey";

export function MobileHeader() {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <motion.header
      className="lg:hidden sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenMobile(!openMobile)}
          className="hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <motion.div
            initial={false}
            animate={{ rotate: openMobile ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {openMobile ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </motion.div>
        </Button>

        {/* Center: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <MonkeyIcon className="size-7" />
          </div>
          <span className="text-lg font-display text-white">Openly</span>
        </div>

        {/* Right: User Button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 ring-2 ring-white/10",
            },
          }}
        />
      </div>
    </motion.header>
  );
}
