"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useCreateProduct } from "@/lib/hooks/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Image as ImageIcon,
  DollarSign,
  CreditCard,
  Settings,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Clock,
  Mail,
  MessageSquare,
  Eye,
  Copy,
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

  const steps = [
    { number: 1, title: "Product Info", icon: ImageIcon },
    { number: 2, title: "Link & Payout", icon: CreditCard },
    { number: 3, title: "Review & Generate", icon: CheckCircle2 },
    { number: 4, title: "Success", icon: CheckCircle2 },
  ];

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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
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

      console.log("🚀 Starting product creation...");

      // Create the product using the hook
      const product = await createProduct({
        image: formData.image || undefined,
        productName: formData.productName,
        description: formData.description,
        amount: formData.amount,
        payoutChain: formData.payoutChain,
        payoutToken: formData.payoutToken,
        slug: formData.slug,
        linkExpiration: formData.linkExpiration,
        customDays: formData.customDays,
      });

      if (!product) {
        const errorMsg = createError || "Failed to create product";
        setErrorMessage(errorMsg);
        console.error("❌ Product creation failed:", errorMsg);
        return;
      }

      // Generate the working payment link
      const baseUrl = window.location.origin;
      const paymentLink = `${baseUrl}/pay/${product.paymentLink}`;

      const generatedLink = {
        id: product.id,
        name: product.productName,
        price: product.amount,
        currency: formData.payoutToken,
        url: paymentLink,
        paymentLink: product.paymentLink,
        createdAt: product.createdAt,
        product: product,
      };

      // Set the generated link to show success state
      setGeneratedLink(generatedLink);
      setCurrentStep(4); // Move to success step (now step 4)
      setErrorMessage(null);

      if (onSuccess) {
        onSuccess(generatedLink);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate link";
      setErrorMessage(errorMsg);
      console.error("❌ Failed to generate link:", error);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Step 1: Product Info</h3>
        <p className="text-muted-foreground">Upload your product details</p>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Upload Product Image</Label>
        <div className="text-xs text-muted-foreground mb-2">
          Recommended: 1:1 ratio, max 5MB
        </div>

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">📤 Upload Image</div>
            <div className="text-xs text-muted-foreground">
              Drag & Drop or Click to Upload
            </div>
          </label>
        </div>

        {formData.imagePreview && (
          <div className="mt-4">
            <Label className="text-sm font-medium">Preview:</Label>
            <div className="mt-2">
              <img
                src={formData.imagePreview}
                alt="Product preview"
                className="w-20 h-20 object-cover rounded-lg border"
              />
            </div>
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="product-name">Product Name *</Label>
        <Input
          id="product-name"
          value={formData.productName}
          onChange={(e) => handleInputChange("productName", e.target.value)}
          placeholder="e.g., Premium Subscription"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="e.g., Monthly premium subscription with advanced features"
          rows={3}
          required
        />
        <div className="text-xs text-muted-foreground">
          Detailed description of the product or service
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD) *</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            placeholder="e.g., 29.99"
            className="pl-10"
            required
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Step 2: Link & Payout Settings
        </h3>
        <p className="text-muted-foreground">
          Configure your payment link and payout preferences
        </p>
      </div>

      {/* Custom Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Payment Link Slug *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
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
            required
            pattern="[a-z0-9-]+"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Use lowercase letters, numbers, and hyphens only
        </div>
      </div>

      {/* Payout Chain */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Payout Chain *</Label>
        <div className="space-y-2">
          {[
            { value: "base-sepolia", label: "Base Sepolia (Testnet)" },
            { value: "base", label: "Base (Mainnet)" },
          ].map((chain) => (
            <label
              key={chain.value}
              className="flex items-center space-x-2 cursor-pointer"
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
              <span>{chain.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payout Token */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Payout Token *</Label>
        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
          <CreditCard className="h-5 w-5" />
          <span>💰 USDC (USD Coin)</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Currently, only USDC is supported for payouts
        </div>
      </div>

      {/* Link Expiration */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Link Expiration *</Label>
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
                  handleInputChange("linkExpiration", e.target.value as any)
                }
                className="w-4 h-4"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Days Input */}
        {formData.linkExpiration === "custom_days" && (
          <div className="mt-3">
            <Label htmlFor="custom-days">Number of Days *</Label>
            <Input
              id="custom-days"
              type="number"
              min="1"
              value={formData.customDays || ""}
              onChange={(e) =>
                handleInputChange("customDays", parseInt(e.target.value))
              }
              placeholder="e.g., 30"
              required
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Step 3: Review & Generate
        </h3>
        <p className="text-muted-foreground">
          Review your product link details
        </p>
      </div>

      {/* Error Message */}
      {(errorMessage || createError) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400 font-medium">
            ❌ Error: {errorMessage || createError}
          </p>
          <p className="text-xs text-red-300 mt-1">
            Please check the console (F12) for detailed error information.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Product Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Product:</span>
              <div className="text-muted-foreground">
                {formData.productName || "Not specified"}
              </div>
            </div>
            <div>
              <span className="font-medium">Amount:</span>
              <div className="text-muted-foreground">
                ${formData.amount || "0.00"}
              </div>
            </div>
            <div>
              <span className="font-medium">Payment Link:</span>
              <div className="text-muted-foreground font-mono text-xs">
                /pay/{formData.slug || "..."}
              </div>
            </div>
            <div>
              <span className="font-medium">Payout Chain:</span>
              <div className="text-muted-foreground capitalize">
                {formData.payoutChain.replace("-", " ")}
              </div>
            </div>
            <div>
              <span className="font-medium">Payout Token:</span>
              <div className="text-muted-foreground">
                {formData.payoutToken}
              </div>
            </div>
            <div>
              <span className="font-medium">Expiration:</span>
              <div className="text-muted-foreground">
                {formData.linkExpiration === "never"
                  ? "Never"
                  : formData.linkExpiration === "custom_days"
                  ? `${formData.customDays} days`
                  : formData.linkExpiration.replace("_", " ")}
              </div>
            </div>
            <div>
              <span className="font-medium">Image:</span>
              <div className="text-muted-foreground">
                {formData.imagePreview ? "🖼️ Uploaded" : "Not uploaded"}
              </div>
            </div>
            <div>
              <span className="font-medium">Description:</span>
              <div className="text-muted-foreground line-clamp-2">
                {formData.description || "No description"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">🎉 Success!</h3>
        <p className="text-muted-foreground">
          Your payment link is ready to share
        </p>
      </div>

      {generatedLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Product Link Created Successfully!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product:</span>
                <div className="text-muted-foreground">
                  {generatedLink.name}
                </div>
              </div>
              <div>
                <span className="font-medium">Price:</span>
                <div className="text-muted-foreground">
                  ${generatedLink.price} USD
                </div>
              </div>
              <div>
                <span className="font-medium">Payment Link:</span>
                <div className="text-muted-foreground font-mono text-xs break-all">
                  {generatedLink.url}
                </div>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <div className="text-muted-foreground">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">
                  Share your payment link:
                </span>
                <div className="mt-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between gap-3">
                    <code className="flex-1 text-sm font-mono text-muted-foreground break-all">
                      {generatedLink.url}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLink.url)}
                      className={`flex items-center space-x-2 shrink-0 ${
                        copySuccess
                          ? "bg-green-100 text-green-700 border-green-300"
                          : ""
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Ready to accept payments!</strong> Share this link
                  with your customers. They'll be redirected to a secure payment
                  page to complete their purchase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex-shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">
                Create Product Link
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Generate a payment link for your product
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 -mt-1 -mr-2"
            >
              ✕
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 sm:mt-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex items-center justify-start sm:justify-left py-2 px-1 gap-1 sm:gap-2 min-w-max sm:min-w-0">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex items-center flex-shrink-0"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    {/* Step Circle */}
                    <div className="relative">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110"
                            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      {/* Pulse effect for current step */}
                      {currentStep === step.number && (
                        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                      )}
                    </div>

                    {/* Step Title */}
                    <span
                      className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap text-center sm:text-left transition-all duration-300 ${
                        currentStep >= step.number
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="relative mx-1 sm:mx-3">
                      <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div
                        className={`absolute top-0 left-0 h-0.5 transition-all duration-500 ${
                          currentStep > step.number
                            ? "w-full bg-gradient-to-r from-blue-500 to-purple-600"
                            : "w-0"
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-hide">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-muted/50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            {currentStep < 4 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}

            <div
              className={`flex items-center gap-2 ${
                currentStep === 4 ? "w-full" : "w-full sm:w-auto"
              }`}
            >
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 &&
                      (!formData.productName ||
                        !formData.amount ||
                        !formData.description)) ||
                    (currentStep === 2 &&
                      (!formData.slug ||
                        (formData.linkExpiration === "custom_days" &&
                          !formData.customDays)))
                  }
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : currentStep === 3 ? (
                <Button
                  onClick={generateLink}
                  disabled={creatingProduct}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  {creatingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      <span>Generate Link</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <span>Done</span>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
