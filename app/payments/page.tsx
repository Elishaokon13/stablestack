"use client";

import { useState } from "react";
import { useTransactions, type Transaction } from "@/lib/hooks/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
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
  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      (tx.customerName || "").toLowerCase().includes(query) ||
      (tx.customerEmail || "").toLowerCase().includes(query) ||
      (tx.slug || "").toLowerCase().includes(query) ||
      (tx.paymentIntentId || "").toLowerCase().includes(query)
    );
  });

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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return "Invalid date";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Payment Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all payment activity
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            <span className="font-medium text-foreground">
              {filteredTransactions.length}
            </span>{" "}
            of {pagination.total} transactions
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">❌ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <CreditCard className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No transactions found
          </h3>
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
                <Card
                  key={transaction.id}
                  className="hover:border-primary/30 transition-all"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Customer & Product Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground font-medium truncate">
                            {transaction.customerName || "Anonymous"}
                          </span>
                          <Badge className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {transaction.customerEmail || "No email"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
                          <span className="truncate">
                            {transaction.slug || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                      </div>

                      {/* Right: Amount */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">
                              ${transaction.amount || "0.00"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {transaction.currency || "USD"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {transaction.paymentMethodTypes?.join(", ") ||
                              "Card"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Intent ID */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground font-mono">
                        {transaction.paymentIntentId || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {pagination.page}
                </span>{" "}
                of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
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
