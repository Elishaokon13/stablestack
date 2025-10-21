"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts, type Product } from "@/lib/hooks/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Copy,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Link as LinkIcon,
  Clock,
} from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const { products, pagination, loading, error, fetchPage } = useProducts({
    page: currentPage,
    limit: 15,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "expired":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Your Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all your payment links
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            <span className="font-medium text-foreground">
              {filteredProducts.length}
            </span>{" "}
            of {pagination.total} products
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search */}
        <div className="flex-1 py-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "active", "inactive", "expired"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={cn(
                "whitespace-nowrap",
                statusFilter === status &&
                  "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#003e91]/40 border-t-[#003e91] rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-lg">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {searchQuery
              ? "Try adjusting your search query or filters"
              : "Create your first product to get started"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Product
            </Button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden h-48">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={cn(
                        getStatusColor(product.status),
                        "backdrop-blur-md text-xs font-medium capitalize border shadow-sm"
                      )}
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>

                {/* Product Details */}
                <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                  {/* Name & Price */}
                  <div className="space-y-2 flex-1">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {product.productName}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.amount}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase font-medium">
                        {product.payoutToken}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Info - Compact */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="w-3.5 h-3.5 text-primary/60" />
                        <span className="uppercase font-medium">
                          {product.payoutChain}
                        </span>
                      </div>
                    </div>
                    {product.expiresAt && (
                      <div className="flex items-center gap-1.5 text-warning">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Expires {formatDate(product.expiresAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        copyToClipboard(product.paymentLink, product.id)
                      }
                      className={cn(
                        "flex-1",
                        copySuccess === product.id
                          ? "bg-success hover:bg-success/90 text-white"
                          : "bg-primary hover:bg-primary/90 text-white"
                      )}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {copySuccess === product.id ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(product.paymentLink, "_blank")}
                      className="px-3 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  disabled={!pagination.hasPrevPage}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
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
