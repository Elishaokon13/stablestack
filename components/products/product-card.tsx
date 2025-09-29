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
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {product.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(product)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(product)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {product.imageUrl && (
          <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <Badge className={statusColors[product.status]}>
              {product.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{categoryLabels[product.category]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(product.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>USDC: {product.priceInUSDC}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Seller: {formatAddress(product.sellerId)}
          </div>
          {product.status === ProductStatus.ACTIVE && (
            <Button size="sm" className="ml-auto">
              Buy Now
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
