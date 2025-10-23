"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWithdraw } from "@/lib/hooks/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: "base" | "base-sepolia";
  availableBalances: {
    usdc: string;
    eth: string;
  };
  onSuccess?: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  chain,
  availableBalances,
  onSuccess,
}: WithdrawModalProps) {
  const { loading, error, result, withdrawSingle } = useWithdraw();
  const [asset, setAsset] = useState<"USDC" | "ETH">("USDC");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [success, setSuccess] = useState(false);

  const maxBalance =
    asset === "USDC" ? availableBalances.usdc : availableBalances.eth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    const result = await withdrawSingle({
      chain,
      asset,
      amount,
      address,
      reference: reference || undefined,
      metadata: { id: Date.now().toString() },
    });

    if (result) {
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setAmount("");
    setAddress("");
    setReference("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full border border-white/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success && result ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Withdrawal Initiated!
              </h3>
              <p className="text-gray-400 text-sm">
                Your withdrawal has been submitted successfully
              </p>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-medium">
                    {result.amount} {result.asset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    {result.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-white font-mono text-xs">
                    {result.transactionId.slice(0, 8)}...
                  </span>
                </div>
                {result.hash && (
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5"
                      onClick={() =>
                        window.open(
                          `https://basescan.org/tx/${result.hash}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on BaseScan
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Asset Selection */}
              <div className="space-y-2">
                <Label>Asset *</Label>
                <div className="flex gap-2">
                  {(["USDC", "ETH"] as const).map((assetType) => (
                    <button
                      key={assetType}
                      type="button"
                      onClick={() => setAsset(assetType)}
                      className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                        asset === assetType
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {assetType}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Available: {maxBalance} {asset}
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    max={maxBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAmount(maxBalance)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Recipient Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  required
                />
              </div>

              {/* Reference (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Withdrawal for..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Chain Info */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  Withdrawing on{" "}
                  <span className="font-semibold uppercase">{chain}</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !address || !amount}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
