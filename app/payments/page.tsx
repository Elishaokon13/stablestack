"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactions, type Transaction } from "@/lib/hooks/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Package,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { transactions, pagination, loading, error, fetchPage } =
    useTransactions({
      page: currentPage,
      limit: 10,
    });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.paymentIntentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (
    status: Transaction["status"]
  ): {
    color: string;
    icon: React.ReactNode;
    label: string;
  } => {
    switch (status) {
      case "SUCCEEDED":
        return {
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "Completed",
        };
      case "PROCESSING":
        return {
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          icon: <Clock className="w-3 h-3" />,
          label: "Processing",
        };
      case "FAILED":
        return {
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          icon: <XCircle className="w-3 h-3" />,
          label: "Failed",
        };
      case "CANCELLED":
        return {
          color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          icon: <XCircle className="w-3 h-3" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: <AlertCircle className="w-3 h-3" />,
          label: status,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Payment Transactions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View all payment activity
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {pagination.total} transactions
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer, email, product, or payment ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-lg">
          <CreditCard className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {searchQuery
              ? "Try adjusting your search query"
              : "Your payment transactions will appear here"}
          </p>
        </div>
      )}

      {/* Transactions List */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);

              return (
                <div
                  key={transaction.id}
                  className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg p-4 sm:p-5 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Customer & Product Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate">
                          {transaction.customerName}
                        </span>
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {transaction.customerEmail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Package className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{transaction.slug}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-green-400">
                            ${transaction.amount}
                          </span>
                          <span className="text-xs text-gray-400">
                            {transaction.currency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.paymentMethodTypes.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Intent ID */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 font-mono">
                      Payment ID: {transaction.paymentIntentId}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
