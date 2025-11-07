"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublicProducts } from "@/lib/hooks/product/use-public-products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  User,
  ShoppingBag,
} from "lucide-react";

export default function UserStorePage() {
  const params = useParams();
  const router = useRouter();
  const uniqueName = params.uniqueName as string;

  const { products, total, loading, error } = usePublicProducts({
    uniqueName,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0062FF]/40 border-t-[#0062FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Products Found
          </h1>
          <p className="text-muted-foreground mb-4">
            {error || `@${uniqueName} hasn't listed any products yet.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            @{uniqueName}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-2">
            Browse available products
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-full">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              {total} {total === 1 ? "Product" : "Products"} Available
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer"
              onClick={() => router.push(`/${uniqueName}/${product.slug}`)}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/10" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm">
                    {product.status}
                  </Badge>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 space-y-3">
                {/* Name */}
                <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {product.productName}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ${product.amount}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {product.payoutToken}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span className="uppercase">{product.payoutChain}</span>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${uniqueName}/${product.slug}`);
                    }}
                  >
                    View Product
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-lg">
            <Package className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <span className="text-foreground font-semibold">Openly</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
