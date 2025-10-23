"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/hooks/product";
import { usePaymentLinks } from "@/lib/hooks/product/use-products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Copy,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Clock,
  Link as LinkIcon,
} from "lucide-react";

export default function LinksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "payment-links" | "products"
  >("all");

  const { products, pagination, loading, error, fetchPage } = useProducts({
    page: currentPage,
    limit: 15,
  });
  const {
    paymentLinks,
    pagination: paymentLinksPagination,
    loading: paymentLinksLoading,
    error: paymentLinksError,
    fetchPage: fetchPaymentLinksPage,
  } = usePaymentLinks({
    page: currentPage,
    limit: 15,
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
    if (dataType === "products") {
      fetchPage(newPage);
    } else if (dataType === "payment-links") {
      fetchPaymentLinksPage(newPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter payment links by search query
  const filteredPaymentLinks = paymentLinks.filter(
    (link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get data based on active tab
  const getDisplayData = () => {
    switch (activeTab) {
      case "payment-links":
        return { data: filteredPaymentLinks, type: "payment-links" as const };
      case "products":
        return { data: filteredProducts, type: "products" as const };
      case "all":
      default:
        // Combine and sort by creation date (newest first)
        const combinedData = [
          ...filteredProducts.map((item) => ({
            ...item,
            itemType: "product" as const,
          })),
          ...filteredPaymentLinks.map((item) => ({
            ...item,
            itemType: "payment-link" as const,
          })),
        ].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });

        return {
          data: combinedData,
          type: "all" as const,
        };
    }
  };

  const { data: displayData, type: dataType } = getDisplayData();

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
            Your Links
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all your payment links and products
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg w-fit">
        {[
          {
            id: "all",
            label: "All",
            count: filteredProducts.length + filteredPaymentLinks.length,
          },
          {
            id: "payment-links",
            label: "Payment Links",
            count: filteredPaymentLinks.length,
          },
          { id: "products", label: "Products", count: filteredProducts.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {(loading || paymentLinksLoading) && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}

      {/* Error State */}
      {(error || paymentLinksError) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">❌ {error || paymentLinksError}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !paymentLinksLoading &&
        !error &&
        !paymentLinksError &&
        displayData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery
                ? "Try adjusting your search query or filters"
                : "Create your first link or product to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Create Link
              </Button>
            )}
          </div>
        )}

      {/* Items Grid */}
      {!loading &&
        !paymentLinksLoading &&
        !error &&
        !paymentLinksError &&
        displayData.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {displayData.map((item) => {
                const isProduct =
                  "itemType" in item
                    ? item.itemType === "product"
                    : dataType === "products";
                const isPaymentLink =
                  "itemType" in item
                    ? item.itemType === "payment-link"
                    : dataType === "payment-links";

                // Type-safe property access
                const itemImage = isProduct ? (item as any).image : null;
                const itemName = isProduct
                  ? (item as any).productName
                  : (item as any).name;
                const itemCurrency = isProduct
                  ? (item as any).payoutToken
                  : (item as any).currency;
                const itemPurpose = isProduct
                  ? (item as any).payoutChain
                  : (item as any).purpose;

                return (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-md overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    {/* Item Image */}
                    <div className="relative bg-muted overflow-hidden h-48">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isProduct ? (
                            <Package className="w-14 h-14 text-primary/20" />
                          ) : (
                            <LinkIcon className="w-14 h-14 text-primary/20" />
                          )}
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          className={cn(
                            isProduct
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20",
                            "backdrop-blur-md text-xs font-medium border shadow-sm"
                          )}
                        >
                          {isProduct ? "Product" : "Payment Link"}
                        </Badge>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          className={cn(
                            getStatusColor(item.status),
                            "backdrop-blur-md text-xs font-medium capitalize border shadow-sm"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                      {/* Name & Price */}
                      <div className="space-y-2 flex-1">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {itemName}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            ${item.amount}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase font-medium">
                            {isProduct
                              ? itemCurrency
                              : itemCurrency?.toUpperCase()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Meta Info - Compact */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {isProduct ? (
                              <>
                                <Package className="w-3.5 h-3.5 text-primary/60" />
                                <span className="uppercase font-medium">
                                  {itemPurpose}
                                </span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-3.5 h-3.5 text-primary/60" />
                                <span className="uppercase font-medium">
                                  {itemPurpose}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {item.expiresAt && (
                          <div className="flex items-center gap-1.5 text-orange-400 text-xs">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Expires {formatDate(item.expiresAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            copyToClipboard(item.paymentLink, item.id)
                          }
                          className={cn(
                            "transition-all rounded-md flex items-center w-full justify-center px-5 py-2.5 text-sm cursor-pointer",
                            copySuccess === item.id
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          {copySuccess === item.id ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                          onClick={() =>
                            window.open(item.paymentLink, "_blank")
                          }
                          className="transition-all rounded-md flex items-center w-fit justify-center px-3 py-2.5 border border-border hover:border-primary/60 text-sm cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {((dataType === "products" && pagination) ||
              (dataType === "payment-links" && paymentLinksPagination)) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-semibold text-foreground">
                    {dataType === "products"
                      ? pagination?.page
                      : paymentLinksPagination?.page}
                  </span>{" "}
                  of{" "}
                  {dataType === "products"
                    ? pagination?.totalPages
                    : paymentLinksPagination?.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage >=
                      (dataType === "products"
                        ? pagination?.totalPages || 1
                        : paymentLinksPagination?.totalPages || 1)
                    }
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
