"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useCreateProduct } from "@/lib/hooks/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  DollarSign,
  CheckCircle2,
  Link as LinkIcon,
  Copy,
  X,
  CreditCard,
  Clock,
} from "lucide-react";

interface ProductLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (link: any) => void;
}

interface ProductData {
  image: File | null;
  imagePreview: string | null;
  productName: string;
  description: string;
  amount: string;
  payoutChain: "base" | "base-sepolia";
  payoutToken: "USDC";
  slug: string;
  linkExpiration: "never" | "7_days" | "30_days" | "custom_days";
  customDays?: number;
}

export function ProductLinkModal({
  isOpen,
  onClose,
  onSuccess,
}: ProductLinkModalProps) {
  const { user } = useUser();
  const {
    createProduct,
    loading: creatingProduct,
    error: createError,
  } = useCreateProduct();
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedLink, setGeneratedLink] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductData>({
    image: null,
    imagePreview: null,
    productName: "",
    description: "",
    amount: "",
    payoutChain: "base-sepolia",
    payoutToken: "USDC",
    slug: "",
    linkExpiration: "never",
    customDays: undefined,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback: show the text in an alert or prompt
      alert("Copy this link: " + text);
    }
  };

  const generateLink = async () => {
    setErrorMessage(null);

    try {
      if (!user?.id) {
        throw new Error("You must be logged in to create a product");
      }

      const product = await createProduct({
        image: formData.image || undefined,
        productName: formData.productName,
        description: formData.description,
        amount: formData.amount,
        payoutChain: formData.payoutChain,
        payoutToken: formData.payoutToken,
        slug: formData.slug,
        linkExpiration: "never",
        customDays: formData.customDays,
      });

      if (!product) {
        const errorMsg = createError || "Failed to create product";
        setErrorMessage(errorMsg);
        return;
      }

      const baseUrl = window.location.origin;
      const paymentLink = `${baseUrl}/pay/${product.paymentLink}`;

      const generatedLink = {
        id: product.id,
        name: product.productName,
        price: product.amount,
        url: paymentLink,
        paymentLink: product.paymentLink,
        createdAt: product.createdAt,
      };

      setGeneratedLink(generatedLink);
      setErrorMessage(null);

      if (onSuccess) {
        onSuccess(generatedLink);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate link";
      setErrorMessage(errorMsg);
    } finally {
      // Loading state is handled by the hook
    }
  };

  const isStep1Valid = formData.productName && formData.imagePreview;
  const isStep2Valid = formData.description && formData.amount && formData.slug;
  const isFormValid = isStep1Valid && isStep2Valid;

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Create Payment Link</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of 2
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {generatedLink ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Link Created!</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment link is ready to share
                </p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{generatedLink.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${generatedLink.price} USD
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Link:</p>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
                        {generatedLink.url}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedLink.url)}
                        className="shrink-0"
                      >
                        {copySuccess ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </motion.div>
          ) : (
            // Form State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Error Message */}
              {(errorMessage || createError) && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">
                    {errorMessage || createError}
                  </p>
                </div>
              )}

              {/* Step 1: Image and Product Name */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Product Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload an image and name your product
                    </p>
                  </div>

                  {/* Image Upload */}
                  <div className="flex flex-col items-start gap-3">
                    <Label>Product Image *</Label>
                    {formData.imagePreview ? (
                      <div className="w-full h-[200px] relative group">
                        <img
                          src={formData.imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain rounded-lg border"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="change-image-upload"
                        />
                        <label
                          htmlFor="change-image-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 bg-opacity-60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          style={{ transition: "opacity 0.2s" }}
                        >
                          <span className="bg-white/80 text-black px-3 py-1 rounded text-sm font-medium shadow flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Change image
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 w-full border-dashed border-muted-foreground/25 rounded-lg p-4 h-[200px] flex items-center justify-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm font-medium">
                            Upload Image
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Max 5MB, png or jpg
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <div className="flex flex-col items-start gap-3">
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      value={formData.productName}
                      onChange={(e) =>
                        handleInputChange("productName", e.target.value)
                      }
                      placeholder="e.g., Premium Subscription"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Remaining Fields */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Payment Settings
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure pricing and link options
                    </p>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col items-start gap-3">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your product or service"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                    {/* Amount */}
                    <div className="flex flex-col w-full items-start gap-3">
                      <Label htmlFor="amount">Amount (USD) *</Label>
                      <div className="relative w-full">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.amount}
                          onChange={(e) =>
                            handleInputChange("amount", e.target.value)
                          }
                          placeholder="29.99"
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="flex flex-col w-full items-start gap-3">
                      <Label htmlFor="slug">Link Slug *</Label>
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm text-muted-foreground">
                          /pay/
                        </span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) =>
                            handleInputChange(
                              "slug",
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            )
                          }
                          placeholder="premium-subscription"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payout Chain */}
                  <div className="flex flex-col items-start gap-3">
                    <Label>Payout Chain</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          value: "base-sepolia",
                          label: "Base Sepolia (Testnet)",
                        },
                        { value: "base", label: "Base (Mainnet)" },
                      ].map((chain) => (
                        <label
                          key={chain.value}
                          className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-muted/50"
                        >
                          <input
                            type="radio"
                            name="payoutChain"
                            value={chain.value}
                            checked={formData.payoutChain === chain.value}
                            onChange={(e) =>
                              handleInputChange(
                                "payoutChain",
                                e.target.value as "base" | "base-sepolia"
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{chain.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Link Expiration */}
                  {/* <div className="space-y-2">
                    <Label>Link Expiration</Label>
                    <div className="space-y-2">
                      {[
                        { value: "never", label: "Never expires" },
                        { value: "7_days", label: "7 days" },
                        { value: "30_days", label: "30 days" },
                        { value: "custom_days", label: "Custom" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="linkExpiration"
                            value={option.value}
                            checked={formData.linkExpiration === option.value}
                            onChange={(e) =>
                              handleInputChange(
                                "linkExpiration",
                                e.target.value as any
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    {formData.linkExpiration === "custom_days" && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          min="1"
                          value={formData.customDays || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "customDays",
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="Number of days"
                        />
                      </div>
                    )}
                  </div> */}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep === 1 ? (
                  <Button onClick={nextStep} disabled={!isStep1Valid}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={generateLink}
                    disabled={!isStep2Valid || creatingProduct}
                  >
                    {creatingProduct ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Create Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
