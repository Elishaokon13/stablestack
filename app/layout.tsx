import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "../lib/v0-context";
import { SidebarProvider } from "../components/ui/sidebar";
import { DashboardSidebar } from "../components/dashboard/sidebar";
import { Providers } from "../components/providers";
import { headers } from "next/headers";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

export const metadata: Metadata = {
  title: {
    template: "Openly",
    default: "Openly - Card Payments, Stablecoins",
  },
  description: "Accept card payments, receive stablecoins. Simple. Fast. Secure.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${robotoMono.variable} antialiased font-sans`}
        >
          <Providers cookies={cookies}>
            <V0Provider isV0={isV0}>
              <SidebarProvider>
                <main className="min-h-screen">{children}</main>
              </SidebarProvider>
            </V0Provider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
