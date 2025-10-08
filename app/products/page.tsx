"use client";

import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { ProductLinkModal } from "@/components/payment/product-link-modal";

export default function ProductsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Log the auth token when component loads
  useEffect(() => {
    const logAuthToken = async () => {
      if (isLoaded && user) {
        try {
          const token = await getToken();
          if (token) {
            console.log("ClerkAuth (http, Bearer):", token);
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
    };
    
    logAuthToken();
  }, [isLoaded, user, getToken]);

  const fetchProducts = async (sellerId: string) => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?sellerId=${sellerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products API response:", data);
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching products.");
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Products",
        description: "Manage your products and payment links",
        icon: Package,
      }}
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Products</h2>
            <p className="text-muted-foreground">
              Create and manage products that accept USDC payments
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleCreateProduct}
              style={{
                background:
                  "linear-gradient(to bottom,rgb(65, 81, 255),rgb(50, 32, 255))",
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id?.toString() || product.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="ring-2 ring-pop h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-display text-primary-foreground">
                        {product.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 text-xs ${
                          product.status === "active"
                            ? "bg-green-900/20 text-green-400 border-green-700/50"
                            : "bg-red-900/20 text-red-400 border-red-700/50"
                        }`}
                      >
                        {product.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {product.description || "No description provided."}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p
                        className="text-lg font-bold text-primary"
                        style={{ color: "#ff5941" }}
                      >
                        ${Number(product.priceInUSDC)?.toFixed(2)} USD
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Number(product.priceInUSDC).toFixed(6)} USDC (on Base)
                      </p>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const paymentLink = `${window.location.origin}/pay/${product.paymentUrl}`;
                          navigator.clipboard.writeText(paymentLink);
                          toast.success("Payment link copied to clipboard!");
                        }}
                        className="w-full justify-start text-left"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Copy Payment Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/pay/${product.paymentUrl}`, "_blank")
                        }
                        className="w-full justify-start text-left"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Payment Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="ring-2 ring-pop">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first product to accept USDC payments
              </p>
              <Button
                onClick={handleCreateProduct}
                style={{
                  background:
                    "linear-gradient(to bottom,rgb(65, 81, 255),rgb(50, 32, 255))",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Product Modal */}
        <ProductLinkModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(product: any) => {
            console.log("Product created:", product);
            setIsCreateModalOpen(false);
            // Optionally refresh the page or show a success message
          }}
        />
      </div>
    </DashboardPageLayout>
  );
}
