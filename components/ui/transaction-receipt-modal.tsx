"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Copy, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CreditCard,
  User,
  Calendar,
  Hash,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  product: string;
  paymentMethod?: string;
  transactionFee?: number;
  netAmount?: number;
  description?: string;
}

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionReceiptModal({ 
  isOpen, 
  onClose, 
  transaction 
}: TransactionReceiptModalProps) {
  if (!transaction) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success("Transaction ID copied to clipboard");
  };

  const handleDownloadReceipt = () => {
    // Create a simple receipt text
    const receiptText = `
TRANSACTION RECEIPT
==================
Transaction ID: ${transaction.id}
Customer: ${transaction.customer}
Amount: $${transaction.amount.toFixed(2)}
Status: ${transaction.status.toUpperCase()}
Product: ${transaction.product}
Date: ${transaction.date}
Payment Method: ${transaction.paymentMethod || "Credit Card"}
${transaction.transactionFee ? `Transaction Fee: $${transaction.transactionFee.toFixed(2)}` : ""}
${transaction.netAmount ? `Net Amount: $${transaction.netAmount.toFixed(2)}` : ""}
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-lg border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              {getStatusIcon(transaction.status)}
              <div>
                <p className="font-semibold text-white">Payment {transaction.status}</p>
                <p className="text-sm text-gray-400">{transaction.date}</p>
              </div>
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Hash className="w-4 h-4" />
                <span className="text-sm">Transaction ID</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-white bg-white/10 px-2 py-1 rounded">
                  {transaction.id}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyTransactionId}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">Customer</span>
              </div>
              <span className="text-white font-medium">{transaction.customer}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Amount</span>
              </div>
              <span className="text-white font-bold text-lg">
                ${transaction.amount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Product</span>
              </div>
              <span className="text-white font-medium">{transaction.product}</span>
            </div>

            {transaction.paymentMethod && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Payment Method</span>
                </div>
                <span className="text-white font-medium">{transaction.paymentMethod}</span>
              </div>
            )}

            {transaction.transactionFee && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Transaction Fee</span>
                </div>
                <span className="text-white font-medium">
                  ${transaction.transactionFee.toFixed(2)}
                </span>
              </div>
            )}

            {transaction.netAmount && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">Net Amount</span>
                </div>
                <span className="text-white font-medium">
                  ${transaction.netAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDownloadReceipt}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
