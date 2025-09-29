"use client";

import React from "react";
import { Product, ProductStatus, ProductCategory } from "../../types/payments";
import { formatAddress } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  Package,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
  showActions?: boolean;
}

const statusColors = {
  [ProductStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [ProductStatus.ACTIVE]: "bg-green-100 text-green-800",
  [ProductStatus.INACTIVE]: "bg-yellow-100 text-yellow-800",
  [ProductStatus.SOLD_OUT]: "bg-red-100 text-red-800",
  [ProductStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
};

const categoryLabels = {
  [ProductCategory.DIGITAL_GOODS]: "Digital Goods",
  [ProductCategory.PHYSICAL_GOODS]: "Physical Goods",
  [ProductCategory.SERVICES]: "Services",
  [ProductCategory.NFT]: "NFT",
  [ProductCategory.SUBSCRIPTION]: "Subscription",
  [ProductCategory.OTHER]: "Other",
};

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onView, 
  showActions = true 
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate text-foreground">
              {product.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent/50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(product)} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(product)}
                    className="text-destructive cursor-pointer focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {product.imageUrl && (
          <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative group">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <Badge 
              className={`${statusColors[product.status]} font-medium px-3 py-1`}
              variant="secondary"
            >
              {product.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4 text-primary/70" />
              <span className="truncate">{categoryLabels[product.category]}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span className="truncate">{formatDate(product.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium">USDC</span>
            </div>
            <span className="font-mono text-sm font-semibold">
              {(parseInt(product.priceInUSDC) / 1000000).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            <span>Seller: {formatAddress(product.sellerId)}</span>
          </div>
          {product.status === ProductStatus.ACTIVE && (
            <Button 
              size="sm" 
              className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 py-2 h-8 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                const paymentLink = `${window.location.origin}/pay/${product.id}`;
                navigator.clipboard.writeText(paymentLink);
                // TODO: Show toast notification
              }}
            >
              Copy Payment Link
            </Button>
          )}
          {product.status === ProductStatus.INACTIVE && (
            <Button 
              size="sm" 
              variant="outline" 
              disabled
              className="ml-auto opacity-50 cursor-not-allowed"
            >
              Inactive
            </Button>
          )}
          {product.status === ProductStatus.DRAFT && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-auto"
            >
              Preview Link
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
