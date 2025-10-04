"use client"

import React, { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Package, DollarSign, Image, Tag, Loader2, CheckCircle2 } from "lucide-react"

interface ProductFormProps {
  onSuccess?: (product: any) => void
  onCancel?: () => void
}

export function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdProduct, setCreatedProduct] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceUSD: "",
    imageUrl: "",
    category: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('You must be logged in to create a product')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: user.id,
          name: formData.name,
          description: formData.description,
          priceUSD: parseFloat(formData.priceUSD),
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      setCreatedProduct(result.product)
      setSuccess(true)
      setFormData({
        name: "",
        description: "",
        priceUSD: "",
        imageUrl: "",
        category: "",
      })

      if (onSuccess) {
        onSuccess(result.product)
      }

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Card className="ring-2 ring-pop">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">
              Product Created Successfully!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your product is now live and ready to accept payments
            </p>
            
            {createdProduct && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Payment Link:</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded border text-sm font-mono break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/pay/{createdProduct.paymentLink}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = `${window.location.origin}/pay/${createdProduct.paymentLink}`
                      navigator.clipboard.writeText(link)
                    }}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this link with customers to accept USDC payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="ring-2 ring-pop">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create New Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className="ring-2 ring-pop"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product"
                rows={3}
                required
                className="ring-2 ring-pop"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="priceUSD" className="text-sm font-medium">
                Price (USD) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="priceUSD"
                  name="priceUSD"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.priceUSD}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  className="pl-10 ring-2 ring-pop"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Price will be automatically converted to USDC
              </p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL
              </Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10 ring-2 ring-pop"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Digital, Physical, Service"
                  className="pl-10 ring-2 ring-pop"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
