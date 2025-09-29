"use client";

import React from "react";
import { Product } from "@/types/payments";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ProductCategory, ProductStatus } from "@/types/payments";

interface ProductsGridProps {
  products: Product[];
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  onProductView?: (product: Product) => void;
  onCreateProduct?: () => void;
  showActions?: boolean;
  isLoading?: boolean;
}

export function ProductsGrid({
  products,
  onProductEdit,
  onProductDelete,
  onProductView,
  onCreateProduct,
  showActions = true,
  isLoading = false,
}: ProductsGridProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: ProductCategory.DIGITAL_GOODS, label: "Digital Goods" },
    { value: ProductCategory.PHYSICAL_GOODS, label: "Physical Goods" },
    { value: ProductCategory.SERVICES, label: "Services" },
    { value: ProductCategory.NFT, label: "NFT" },
    { value: ProductCategory.SUBSCRIPTION, label: "Subscription" },
    { value: ProductCategory.OTHER, label: "Other" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: ProductStatus.DRAFT, label: "Draft" },
    { value: ProductStatus.ACTIVE, label: "Active" },
    { value: ProductStatus.INACTIVE, label: "Inactive" },
    { value: ProductStatus.SOLD_OUT, label: "Sold Out" },
    { value: ProductStatus.ARCHIVED, label: "Archived" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
        
        {onCreateProduct && (
          <Button onClick={onCreateProduct} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first product"
            }
          </p>
          {onCreateProduct && (
            <Button onClick={onCreateProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onProductEdit}
              onDelete={onProductDelete}
              onView={onProductView}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
