import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "../lib/v0-context";
import localFont from "next/font/local";
import { SidebarProvider } from "../components/ui/sidebar";
import { DashboardSidebar } from "../components/dashboard/sidebar";
import { Providers } from "../components/providers";
import { headers } from "next/headers";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
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
        <head>
          <link
            rel="preload"
            href="/fonts/Rebels-Fett.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </head>
        <body
          className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}
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
