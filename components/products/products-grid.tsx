"use client";

import React from "react";
import { Product } from "../../types/payments";
import { ProductCard } from "./product-card";
import { Button } from "../ui/button";
import { Plus, Grid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { ProductCategory, ProductStatus } from "../../types/payments";

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
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-80">
                <div className="p-4 space-y-4">
                  <div className="h-6 bg-muted-foreground/20 rounded"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-32 bg-muted-foreground/20 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
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
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground">Payment Links</h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} of {products.length} payment links
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {onCreateProduct && (
          <Button 
            onClick={onCreateProduct} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 h-10 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Link
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex-1">
          <Input
            placeholder="Search payment links by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-10 bg-background border-border/50 focus:border-primary/50">
              <SelectValue placeholder="All Categories" />
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
            <SelectTrigger className="w-[180px] h-10 bg-background border-border/50 focus:border-primary/50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border border-border/50 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none border-r border-border/50 h-10 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none h-10 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6">
            <Plus className="h-12 w-12 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "No products match your filters"
              : "No products yet"
            }
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "Get started by creating your first product and start selling in the Web3 ecosystem."
            }
          </p>
          {onCreateProduct && (
            <Button 
              onClick={onCreateProduct}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 h-10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Product
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
