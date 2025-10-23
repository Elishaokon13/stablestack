"use client";

import { useState } from "react";
import { useTransactions, type Transaction } from "@/lib/hooks/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Grid3X3,
  List,
  Download,
  Filter,
  Eye,
  Copy,
} from "lucide-react";

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Payment Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all payment activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {pagination && (
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              <span className="font-medium text-foreground">
                {filteredTransactions.length}
              </span>{" "}
              of {pagination.total} transactions
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-2",
                viewMode === "cards" && "bg-primary text-primary-foreground"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              Cards
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-2",
                viewMode === "table" && "bg-primary text-primary-foreground"
              )}
            >
              <List className="w-4 h-4" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
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
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((transaction) => {
                const statusConfig = getStatusConfig(transaction.status);

                return (
                  <Card
                    key={transaction.id}
                    className="hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate">
                              {transaction.customerName || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.customerEmail || "No email"}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1 text-xs">
                            {statusConfig.label}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span className="truncate">
                            {transaction.slug || "N/A"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${transaction.amount || "0.00"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.currency || "USD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span>
                            {transaction.paymentMethodTypes?.join(", ") ||
                              "Card"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {transaction.paymentIntentId || "N/A"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                transaction.paymentIntentId || ""
                              );
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTransactions.map((transaction) => {
                        const statusConfig = getStatusConfig(
                          transaction.status
                        );

                        return (
                          <tr
                            key={transaction.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleTransactionClick(transaction)}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {transaction.customerName || "Anonymous"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {transaction.customerEmail || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {transaction.slug || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-right">
                                <p className="font-semibold text-primary">
                                  ${transaction.amount || "0.00"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.currency || "USD"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={statusConfig.color}>
                                {statusConfig.icon}
                                <span className="ml-1">
                                  {statusConfig.label}
                                </span>
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTransactionClick(transaction);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      transaction.paymentIntentId || ""
                                    );
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Transaction Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm">
                      {selectedTransaction.customerName || "Anonymous"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm">
                      {selectedTransaction.customerEmail || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Transaction Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Amount
                    </label>
                    <p className="text-lg font-bold text-primary">
                      ${selectedTransaction.amount || "0.00"}{" "}
                      {selectedTransaction.currency || "USD"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={
                          getStatusConfig(selectedTransaction.status).color
                        }
                      >
                        {getStatusConfig(selectedTransaction.status).icon}
                        <span className="ml-1">
                          {getStatusConfig(selectedTransaction.status).label}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Product
                    </label>
                    <p className="text-sm">
                      {selectedTransaction.slug || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date
                    </label>
                    <p className="text-sm">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Payment Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Intent ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {selectedTransaction.paymentIntentId || "N/A"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            selectedTransaction.paymentIntentId || ""
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Method
                    </label>
                    <p className="text-sm">
                      {selectedTransaction.paymentMethodTypes?.join(", ") ||
                        "Card"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={() =>
                    copyToClipboard(selectedTransaction.paymentIntentId || "")
                  }
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Payment ID
                </Button>
                <Button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex items-center gap-2"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
