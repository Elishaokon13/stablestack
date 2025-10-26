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
        description: "This page is not found.",
        icon: CuteRobotIcon,
      }}
    >
      <div className="flex flex-col h-screen items-center justify-center gap-10 flex-1">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-bold uppercase text-muted-foreground">
            Not found
          </h1>
          <p className="text-sm max-w-sm text-center text-muted-foreground text-balance">
            This page is not found.
          </p>
          <Button
            onClick={handleGoBack}
            className="mt-4 bg-primary hover:bg-primary/90 text-white"
          >
            {isLoaded && user ? "Go to Dashboard" : "Go to Home"}
          </Button>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
