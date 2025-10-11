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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            No Products Found
          </h1>
          <p className="text-gray-400 mb-4">
            {error || `@${uniqueName} hasn't listed any products yet.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            @{uniqueName}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-2">
            Browse available products
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              {total} {total === 1 ? "Product" : "Products"} Available
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all group cursor-pointer"
              onClick={() => router.push(`/${uniqueName}/${product.slug}`)}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
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
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {product.productName}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-400">
                    ${product.amount}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {product.payoutToken}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all"
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg">
            <Package className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">
              Powered by{" "}
              <span className="text-white font-semibold">Stablestack</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
