"use client";
import React from "react";
import DashboardPageLayout from "../../components/dashboard/layout";
import DashboardStat from "../../components/dashboard/stat";
import DashboardChart from "../../components/dashboard/chart";
import RebelsRanking from "../../components/dashboard/rebels-ranking";
import SecurityStatus from "../../components/dashboard/security-status";
import BracketsIcon from "../../components/icons/brackets";
import GearIcon from "../../components/icons/gear";
import ProcessorIcon from "../../components/icons/proccesor";
import BoomIcon from "../../components/icons/boom";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import mockDataJson from "../../mock.json";
import type { MockData } from "../../types/dashboard";

const mockData = mockDataJson as MockData;

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Web3 Payments Dashboard",
        description: "Manage your Web3 payments and wallet",
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockData.dashboardStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>

      <div className="mb-6">
        <DashboardChart />
      </div>

      {/* Main 2-column grid section */}
      <div className="w-full">
        <RebelsRanking rebels={mockData.rebelsRanking} />
      </div>
    </DashboardPageLayout>
  );
}
