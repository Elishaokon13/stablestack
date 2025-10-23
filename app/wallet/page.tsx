"use client";

import { useState } from "react";
import { useWalletBalance, usePayoutTransactions } from "@/lib/hooks/wallet";
import { WithdrawModal } from "@/components/wallet/withdraw-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Send,
  Download,
  Wallet as WalletIcon,
  History as HistoryIcon,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

// Helper function to safely format dates
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleString();
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return "Invalid date";
  }
};

export default function WalletPage() {
  const [selectedChain, setSelectedChain] = useState<"base" | "base-sepolia">(
    "base-sepolia"
  );
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { balance, loading, error, refetch } = useWalletBalance({
    chain: selectedChain,
  });

  const {
    transactions,
    count: transactionCount,
    loading: loadingTransactions,
    refetch: refetchTransactions,
  } = usePayoutTransactions(selectedChain);

  const totalUSDC =
    balance?.balances.find((b) => b.asset === "USDC")?.convertedBalance || "0";

  const totalETH =
    balance?.balances.find((b) => b.asset === "ETH")?.convertedBalance || "0";

  const handleRefresh = () => {
    refetch();
    refetchTransactions();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Wallet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your crypto balances
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={loading || loadingTransactions}
          className="hover:bg-primary/10 hover:border-primary/50"
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 mr-1",
              (loading || loadingTransactions) && "animate-spin"
            )}
          />
          Refresh
        </Button>
      </div>

      {/* Chain Selector */}
      <div className="flex gap-2">
        {(["base-sepolia", "base"] as const).map((chain) => (
          <Button
            key={chain}
            size="sm"
            variant={selectedChain === chain ? "default" : "outline"}
            onClick={() => setSelectedChain(chain)}
            className={cn(
              selectedChain === chain &&
                "bg-primary hover:bg-primary/90 text-white"
            )}
          >
            {chain === "base" ? "Base Mainnet" : "Base Sepolia"}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#003e91]/40 border-t-[#003e91] rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading wallet balance...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Wallet Content */}
      {!loading && !error && balance && (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USDC Balance */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">USDC Balance</p>
                    <Badge className="mt-1 bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      Stablecoin
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">
                  ${parseFloat(totalUSDC).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {totalUSDC} USDC on {selectedChain}
                </p>
              </div>
            </div>

            {/* ETH Balance */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ETH Balance</p>
                    <Badge className="mt-1 bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                      Crypto
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">
                  {parseFloat(totalETH).toFixed(6)} ETH
                </p>
                <p className="text-xs text-gray-400">
                  ≈ ${parseFloat(totalETH).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsWithdrawModalOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={() => alert("Deposit feature coming soon!")}
            >
              <Download className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>

          {/* Wallet Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              Wallet Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Chain</span>
                <span className="text-white font-medium uppercase">
                  {balance.chain}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-mono text-xs">
                  {balance.userId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white">
                  {new Date(balance.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Assets</span>
                <span className="text-white font-medium">
                  {balance.balances.length}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <HistoryIcon className="w-5 h-5" />
                Recent Transactions
              </h3>
              {transactionCount > 0 && (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {transactionCount}
                </Badge>
              )}
            </div>

            {loadingTransactions ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Transaction Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => {
                      const statusIcon =
                        tx.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : tx.status === "pending" ? (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        );

                      const statusColor =
                        tx.status === "completed"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : tx.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20";

                      return (
                        <tr
                          key={tx.id}
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                            index === transactions.length - 1 ? "border-0" : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <Badge className={statusColor}>
                              {statusIcon}
                              <span className="ml-1 capitalize text-xs">
                                {tx.status || "unknown"}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-medium">
                              {tx.amount || "0"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              {tx.token || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 text-sm">
                              {formatDate(tx.timestamp)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {tx.txHash ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-mono text-xs">
                                  {tx.txHash.slice(0, 10)}...
                                  {tx.txHash.slice(-8)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 hover:bg-white/10"
                                  onClick={() =>
                                    window.open(
                                      `https://basescan.org/tx/${tx.txHash}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        chain={selectedChain}
        availableBalances={{
          usdc: totalUSDC,
          eth: totalETH,
        }}
        onSuccess={() => {
          handleRefresh();
          setTimeout(() => setIsWithdrawModalOpen(false), 2000);
        }}
      />
    </div>
  );
}
