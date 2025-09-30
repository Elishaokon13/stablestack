import React from "react";

interface DashboardPageLayoutProps {
  children: React.ReactNode;

  header: {
    title: string;
    description?: string;
  };
}

export default function DashboardPageLayout({
  children,
  header,
}: DashboardPageLayoutProps) {
  return (
    <div className="flex flex-col relative w-full gap-1 min-h-full">
      <div className="flex items-center lg:items-baseline gap-2.5 md:gap-4 px-4 md:px-6 py-3 md:pb-4 lg:pt-7 ring-2 ring-pop sticky top-header-mobile lg:top-0 bg-background z-10">
        <h1 className="text-xl lg:text-2xl font-display leading-[1] mb-1">
          {header.title}
        </h1>
        {header.description && (
          <span className="ml-auto text-xs md:text-sm text-muted-foreground block">
            {header.description}
          </span>
        )}
      </div>
      <div className="min-h-full flex-1 flex flex-col gap-8 md:gap-14 px-3 lg:px-6 py-6 md:py-10 ring-2 ring-pop bg-background">
        {children}
      </div>
    </div>
  );
}
