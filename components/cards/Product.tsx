"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Edit,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    priceUSD: number;
    priceUSDC: string;
    paymentLink: string;
    isActive: boolean;
    imageUrl?: string;
    category?: string;
    createdAt: string;
  };
  isOwner?: boolean;
  onToggleStatus?: (productId: string, isActive: boolean) => void;
  onEdit?: (product: any) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: any) => void;
}

export function ProductCard({
  product,
  isOwner = false,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
}: ProductCardProps) {
  const formatUSDC = (usdcAmount: string) => {
    const amount = parseInt(usdcAmount) / 1e6; // Convert from wei to USDC
    return amount.toFixed(2);
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(product.id, !product.isActive);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(product);
    } else {
      // Default: open payment page
      window.open(`/pay/${product.paymentLink}`, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`ring-2 ring-pop ${!product.isActive ? "opacity-60" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {product.name}
              </CardTitle>
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={product.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Product Image */}
          {product.imageUrl ? (
            <div className="relative w-full h-[280px] rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[280px] rounded-lg bg-muted flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                ${product.priceUSD.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">USDC</div>
              <div className="text-sm font-medium">
                {formatUSDC(product.priceUSDC)}
              </div>
            </div>
          </div>

          {/* Payment Link */}
          <div className="p-2 rounded-lg bg-muted">
            <div className="text-xs text-muted-foreground mb-1">
              Payment Link:
            </div>
            <div className="text-sm font-mono break-all">
              /pay/{product.paymentLink}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  className="flex-1"
                >
                  {product.isActive ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Activate
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(product)}
                >
                  <Edit className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleView}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Product
              </Button>
            )}
          </div>

          {/* Created Date */}
          <div className="text-xs text-muted-foreground">
            Created {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
