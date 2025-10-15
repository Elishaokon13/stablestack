"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts, type Product } from "@/lib/hooks/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  Edit,
  Trash2,
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Your Products
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage all your payment links
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} of {pagination.total} products
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "active", "inactive", "expired"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap ${
                statusFilter === status
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5 transition-all group"
              >
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`${getStatusColor(
                        product.status
                      )} backdrop-blur-sm text-xs`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4 space-y-3">
                  {/* Name & Price */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white truncate">
                      {product.productName}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-green-400">
                        ${product.amount}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {product.payoutToken}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>

                  <Separator className="bg-white/10" />

                  {/* Meta Info */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate font-mono">
                        /{product.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                    {product.expiresAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Expires {formatDate(product.expiresAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 flex-shrink-0" />
                      <span className="uppercase">{product.payoutChain}</span>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        copyToClipboard(product.paymentLink, product.id)
                      }
                      className={`flex-1 ${
                        copySuccess === product.id
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <Copy className="w-3 h-3 mr-1.5" />
                      {copySuccess === product.id ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(product.paymentLink, "_blank")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
                  disabled={!pagination.hasPrevPage}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
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
