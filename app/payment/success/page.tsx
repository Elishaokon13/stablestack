"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Home } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntentId = searchParams.get("payment_intent");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    console.log("🎉 Payment Success Page");
    console.log("💳 Payment Intent ID:", paymentIntentId);
  }, [paymentIntentId]);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${day} ${month} ${year} • ${time}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Receipt Card */}
      <Card className="w-full max-w-lg">
        <CardContent className="pt-12 pb-8 px-8 space-y-8">
          {/* Success Icon */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold">Thank you!</h1>
            <p className="text-base">
              Your ticket has been issued successfully
            </p>
          </div>

          <div className="w-full p-5 bg-white/10 flex items-center justify-center flex-col">
            <div className="text-center">
              <p className="!text-[52px] font-bold">$35.00</p>
              <p className="text-base font-medium">
                {formatDate(currentDateTime)}
              </p>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-zinc-200 dark:border-zinc-700" />
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-6">
            {/* Ticket ID and Amount Row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs mb-2 font-medium tracking-wider uppercase">
                  Ticket ID
                </p>
                <p className="text-lg font-semibold max-w-[200px]">
                  {paymentIntentId || "0120034399434"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-2 font-medium tracking-wider uppercase">
                  Amount
                </p>
                <p className="text-lg font-semibold">$35.00</p>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <p className="text-xs mb-2 font-medium tracking-wider uppercase">
                Date & Time
              </p>
              <p className="text-base font-medium">
                {formatDate(currentDateTime)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white/10 rounded-lg p-5 flex items-center gap-4">
              <div className="flex-shrink-0">
                {/* Mastercard Logo */}
                <svg
                  width="48"
                  height="32"
                  viewBox="0 0 48 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="16" cy="16" r="12" fill="#EB001B" />
                  <circle cx="32" cy="16" r="12" fill="#F79E1B" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold mb-0.5">Card Payment</p>
                <p className="text-sm font-mono tracking-wider">
                  •••• •••• •••• {paymentIntentId?.slice(-4) || "bMnr"}
                </p>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="pt-2">
            <div className="bg-white/10 p-6 rounded-lg">
              <svg
                width="100%"
                height="100"
                viewBox="0 0 280 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Dense barcode pattern for realistic look */}
                <rect x="10" y="15" width="2" height="70" fill="black" />
                <rect x="14" y="15" width="4" height="70" fill="black" />
                <rect x="20" y="15" width="2" height="70" fill="black" />
                <rect x="24" y="15" width="3" height="70" fill="black" />
                <rect x="29" y="15" width="2" height="70" fill="black" />
                <rect x="33" y="15" width="4" height="70" fill="black" />
                <rect x="39" y="15" width="2" height="70" fill="black" />
                <rect x="43" y="15" width="3" height="70" fill="black" />
                <rect x="48" y="15" width="2" height="70" fill="black" />
                <rect x="52" y="15" width="4" height="70" fill="black" />
                <rect x="58" y="15" width="2" height="70" fill="black" />
                <rect x="62" y="15" width="3" height="70" fill="black" />
                <rect x="67" y="15" width="2" height="70" fill="black" />
                <rect x="71" y="15" width="4" height="70" fill="black" />
                <rect x="77" y="15" width="2" height="70" fill="black" />
                <rect x="81" y="15" width="3" height="70" fill="black" />
                <rect x="86" y="15" width="2" height="70" fill="black" />
                <rect x="90" y="15" width="4" height="70" fill="black" />
                <rect x="96" y="15" width="2" height="70" fill="black" />
                <rect x="100" y="15" width="3" height="70" fill="black" />
                <rect x="105" y="15" width="2" height="70" fill="black" />
                <rect x="109" y="15" width="4" height="70" fill="black" />
                <rect x="115" y="15" width="2" height="70" fill="black" />
                <rect x="119" y="15" width="3" height="70" fill="black" />
                <rect x="124" y="15" width="2" height="70" fill="black" />
                <rect x="128" y="15" width="4" height="70" fill="black" />
                <rect x="134" y="15" width="2" height="70" fill="black" />
                <rect x="138" y="15" width="3" height="70" fill="black" />
                <rect x="143" y="15" width="2" height="70" fill="black" />
                <rect x="147" y="15" width="4" height="70" fill="black" />
                <rect x="153" y="15" width="2" height="70" fill="black" />
                <rect x="157" y="15" width="3" height="70" fill="black" />
                <rect x="162" y="15" width="2" height="70" fill="black" />
                <rect x="166" y="15" width="4" height="70" fill="black" />
                <rect x="172" y="15" width="2" height="70" fill="black" />
                <rect x="176" y="15" width="3" height="70" fill="black" />
                <rect x="181" y="15" width="2" height="70" fill="black" />
                <rect x="185" y="15" width="4" height="70" fill="black" />
                <rect x="191" y="15" width="2" height="70" fill="black" />
                <rect x="195" y="15" width="3" height="70" fill="black" />
                <rect x="200" y="15" width="2" height="70" fill="black" />
                <rect x="204" y="15" width="4" height="70" fill="black" />
                <rect x="210" y="15" width="2" height="70" fill="black" />
                <rect x="214" y="15" width="3" height="70" fill="black" />
                <rect x="219" y="15" width="2" height="70" fill="black" />
                <rect x="223" y="15" width="4" height="70" fill="black" />
                <rect x="229" y="15" width="2" height="70" fill="black" />
                <rect x="233" y="15" width="3" height="70" fill="black" />
                <rect x="238" y="15" width="2" height="70" fill="black" />
                <rect x="242" y="15" width="4" height="70" fill="black" />
                <rect x="248" y="15" width="2" height="70" fill="black" />
                <rect x="252" y="15" width="3" height="70" fill="black" />
                <rect x="257" y="15" width="2" height="70" fill="black" />
                <rect x="261" y="15" width="4" height="70" fill="black" />
                <rect x="267" y="15" width="2" height="70" fill="black" />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="lg"
              className="w-full h-12 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>

          {/* Footer Text */}
          <div className="text-center pt-4">
            <p className="text-xs">
              A receipt has been sent to your email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
