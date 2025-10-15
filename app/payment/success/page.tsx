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
                <p className="text-lg font-semibold w-[120px] truncate">
                  {paymentIntentId || "0120034399434"}
                </p>
              </div>
              <div>
                <p className="text-xs mb-2 font-medium tracking-wider uppercase">
                  Payment Method
                </p>
                <p className="text-lg font-semibold">
                  •••• •••• •••• {paymentIntentId?.slice(-4) || "bMnr"}
                </p>
              </div>
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
              <div>
                <p className="text-xs mb-2 font-medium tracking-wider uppercase">
                  Payment Method
                </p>
                <p className="text-lg font-semibold">
                  •••• •••• •••• {paymentIntentId?.slice(-4) || "bMnr"}
                </p>
              </div>
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
