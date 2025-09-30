import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "../lib/v0-context";
import localFont from "next/font/local";
import { SidebarProvider } from "../components/ui/sidebar";
import { Providers } from "../components/providers";
import { headers } from "next/headers";
import React from "react";
import { ConditionalDashboardLayout } from "../components/conditional-dashboard-layout";
import mockDataJson from "../mock.json";
import type { MockData } from "../types/dashboard";

const mockData = mockDataJson as MockData;

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
    template: "%s – Paystack for Web3",
    default: "Paystack for Web3",
  },
  description:
    "The ultimate payment platform for Web3. Accept card payments, receive USDC in your wallet.",
    generator: 'v0.app'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en" className="dark">
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
            <ConditionalDashboardLayout mockData={mockData}>
              {children}
            </ConditionalDashboardLayout>
          </V0Provider>
        </Providers>
      </body>
    </html>
  );
}
