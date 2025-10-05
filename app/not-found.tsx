"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import DashboardPageLayout from "@/components/dashboard/layout";
import CuteRobotIcon from "@/components/icons/cute-robot";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const handleGoBack = () => {
    if (isLoaded && user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Not found",
        description: "page under construction",
        icon: CuteRobotIcon,
      }}
    >
      <div className="flex flex-col h-screen items-center justify-center gap-10 flex-1">
        <picture className="w-1/4 aspect-square grayscale opacity-50">
          <Image
            src="/assets/bot_greenprint.gif"
            alt="Security Status"
            width={1000}
            height={1000}
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="size-full object-contain"
          />
        </picture>

        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-bold uppercase text-muted-foreground">
            Not found, yet
          </h1>
          <p className="text-sm max-w-sm text-center text-muted-foreground text-balance">
            Fork on v0 and start promoting your way to new pages.
          </p>
          <Button
            onClick={handleGoBack}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isLoaded && user ? "Go to Dashboard" : "Go to Home"}
          </Button>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
