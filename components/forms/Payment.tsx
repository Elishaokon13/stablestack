"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Wallet,
} from "lucide-react";

interface PaymentButtonProps {
  product: {
    id: string;
    name: string;
    priceUSD: number;
    priceUSDC: string;
    paymentLink: string;
  };
  onPaymentSuccess?: (payment: any) => void;
  onPaymentError?: (error: string) => void;
}

type PaymentStatus =
  | "idle"
  | "processing"
  | "confirming"
  | "success"
  | "error"
  | "insufficient_balance";

export function PaymentButton({
  product,
  onPaymentSuccess,
  onPaymentError,
}: PaymentButtonProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<any>(null);

  const formatUSDC = (usdcAmount: string) => {
    const amount = parseInt(usdcAmount) / 1e6;
    return amount.toFixed(2);
  };

  const handlePayment = async () => {
    setStatus("processing");
    setError(null);

    try {
      // Create payment record
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          buyerId: "",
          buyerEmail: "",
          buyerName: "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment");
      }

      setPayment(result.payment);
      setStatus("confirming");

      // In a real implementation, you would:
      // 1. Open wallet for USDC transfer
      // 2. Send USDC transaction
      // 3. Wait for confirmation
      // 4. Verify transaction on-chain
      // 5. Update payment status

      // For now, we'll simulate the payment process
      setTimeout(() => {
        setStatus("success");
        if (onPaymentSuccess) {
          onPaymentSuccess(result.payment);
        }
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setStatus("error");
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "confirming":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "processing":
        return "Processing...";
      case "confirming":
        return "Confirming...";
      case "success":
        return "Payment Successful!";
      case "error":
        return "Payment Failed";
      case "insufficient_balance":
        return "Insufficient Balance";
      default:
        return "Pay with USDC";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
      case "insufficient_balance":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Card className="ring-2 ring-pop">
          <CardContent className="p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">
              Payment Successful!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your payment of {formatUSDC(product.priceUSDC)} USDC has been
              processed
            </p>
            {payment && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-sm font-mono">
                  Payment ID: {payment.id.slice(-8)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="ring-2 ring-pop">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                ${product.priceUSD.toFixed(2)}
              </span>
            </div>
            <Badge variant="outline">
              {formatUSDC(product.priceUSDC)} USDC
            </Badge>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
          <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-600 dark:text-green-400">
            Wallet Connected:
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={status === "processing" || status === "confirming"}
          className="w-full"
        >
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
        </Button>

        {/* Payment Link */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Or share this payment link:
          </p>
          <div className="p-2 rounded-lg bg-muted">
            <div className="text-sm font-mono break-all">
              {window.location.origin}/pay/{product.paymentLink}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/pay/${product.paymentLink}`
              );
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
