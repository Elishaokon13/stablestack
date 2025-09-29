"use client";

import React, { useState } from "react";
import { ProductsGrid } from "../../components/products/products-grid";
import { ProductForm } from "../../components/products/product-form";
import { Product, CreateProductForm, ProductCategory, ProductStatus } from "../../types/payments";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Wallet, Plus } from "lucide-react";

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: "1",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "Premium Digital Art Collection",
    description: "A stunning collection of digital artworks created by renowned artists. Perfect for NFT collectors and art enthusiasts.",
    price: 299.99,
    priceInUSDC: "299990000", // 299.99 USDC with 6 decimals
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: ProductCategory.DIGITAL_GOODS,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "Web3 Development Course",
    description: "Complete course covering smart contracts, DeFi protocols, and blockchain development. Includes hands-on projects and certification.",
    price: 199.00,
    priceInUSDC: "199000000",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    category: ProductCategory.SERVICES,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "Crypto Trading Bot",
    description: "Automated trading bot for cryptocurrency markets. Features advanced algorithms and risk management tools.",
    price: 499.99,
    priceInUSDC: "499990000",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: ProductCategory.DIGITAL_GOODS,
    status: ProductStatus.DRAFT,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    sellerId: "0x9876543210987654321098765432109876543210",
    name: "Blockchain Consulting Session",
    description: "One-on-one consultation with blockchain experts. Get personalized advice for your Web3 project.",
    price: 150.00,
    priceInUSDC: "150000000",
    category: ProductCategory.SERVICES,
    status: ProductStatus.ACTIVE,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    sellerId: "0x1234567890123456789012345678901234567890",
    name: "DeFi Yield Farming Guide",
    description: "Comprehensive guide to DeFi yield farming strategies. Learn how to maximize returns while managing risks.",
    price: 79.99,
    priceInUSDC: "79990000",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
    category: ProductCategory.DIGITAL_GOODS,
    status: ProductStatus.SOLD_OUT,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();

  const handleCreateProduct = async (data: CreateProductForm) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProduct: Product = {
      id: Date.now().toString(),
      sellerId: address || "0x0000000000000000000000000000000000000000",
      name: data.name,
      description: data.description,
      price: data.price,
      priceInUSDC: (data.price * 1000000).toString(), // Convert to 6 decimals
      imageUrl: data.imageUrl,
      category: data.category,
      status: ProductStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: data.metadata,
    };
    
    setProducts(prev => [newProduct, ...prev]);
    setIsLoading(false);
  };

  const handleEditProduct = (product: Product) => {
    // TODO: Implement edit functionality
    console.log("Edit product:", product);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleViewProduct = (product: Product) => {
    // TODO: Implement view functionality
    console.log("View product:", product);
  };

  if (!isConnected || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to view and manage products.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductsGrid
        products={products}
        onProductEdit={handleEditProduct}
        onProductDelete={handleDeleteProduct}
        onProductView={handleViewProduct}
        onCreateProduct={() => setIsCreateModalOpen(true)}
        showActions={true}
        isLoading={isLoading}
      />

      <ProductForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
        title="Create New Product"
        description="Add a new product to your Web3 store. Buyers will pay with cards and you'll receive USDC in your wallet."
      />
    </div>
  );
}
