"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
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
  name: string;
  description: string;
  price: string;
  category?: string;
  paymentMethod: "card";
  payoutCurrency: "ETH" | "USDC" | "BTC";
  walletAddress: string;
  customLinkName: string;
  expiration: "never" | "7" | "30";
  emailNotifications: boolean;
  telegramNotifications: boolean;
}

export function ProductLinkModal({
  isOpen,
  onClose,
  onSuccess,
}: ProductLinkModalProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [formData, setFormData] = useState<ProductData>({
    image: null,
    imagePreview: null,
    name: "",
    description: "",
    price: "",
    paymentMethod: "card",
    payoutCurrency: "USDC",
    walletAddress: "",
    customLinkName: "",
    expiration: "never",
    emailNotifications: true,
    telegramNotifications: false,
  });

  const steps = [
    { number: 1, title: "Product Info", icon: ImageIcon },
    { number: 2, title: "Payment & Payout", icon: CreditCard },
    { number: 3, title: "Link Settings", icon: Settings },
    { number: 4, title: "Review & Generate", icon: CheckCircle2 },
    { number: 5, title: "Success", icon: CheckCircle2 },
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
    if (currentStep < 4) {
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
    setIsGenerating(true);
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to create a product");
      }

      // Create the product via API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: user.id,
          name: formData.name,
          description: formData.description || "",
          priceUSD: parseFloat(formData.price),
          imageUrl: formData.imagePreview || undefined,
          category: formData.category || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      const product = result.product;

      // Generate the working payment link
      const baseUrl = window.location.origin;
      const paymentLink = `${baseUrl}/pay/${product.paymentLink}`;

      const generatedLink = {
        id: product.id,
        name: product.name,
        price: product.priceUSD,
        currency: formData.payoutCurrency,
        url: paymentLink,
        paymentLink: product.paymentLink,
        createdAt: product.createdAt,
        product: product,
      };

      // Set the generated link to show success state
      setGeneratedLink(generatedLink);
      setCurrentStep(5); // Move to success step

      if (onSuccess) {
        onSuccess(generatedLink);
      }
    } catch (error) {
      console.error("Failed to generate link:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsGenerating(false);
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
        <Label htmlFor="product-name">Product Name</Label>
        <Input
          id="product-name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., Base Builder Hoodie"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Briefly describe your product (optional)."
          rows={3}
        />
        <div className="text-xs text-muted-foreground">
          Example: "Premium cotton hoodie with Base blue accent."
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="e.g., 49.99"
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
        <h3 className="text-xl font-semibold mb-2">Step 2: Payment & Payout</h3>
        <p className="text-muted-foreground">
          Configure payment and payout settings
        </p>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Accept Payment With:</Label>
        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
          <CreditCard className="h-5 w-5" />
          <span>💳 Card (via Paystack / Stripe)</span>
        </div>
      </div>

      {/* Payout Currency */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Receive Payout In:</Label>
        <div className="space-y-2">
          {(["ETH", "USDC", "BTC"] as const).map((currency) => (
            <label
              key={currency}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="payoutCurrency"
                value={currency}
                checked={formData.payoutCurrency === currency}
                onChange={(e) =>
                  handleInputChange("payoutCurrency", e.target.value)
                }
                className="w-4 h-4"
              />
              <span>🔘 {currency} (Base)</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Select where you want to receive crypto.
        </div>
      </div>

      {/* Wallet Address */}
      <div className="space-y-2">
        <Label htmlFor="wallet-address">Wallet Address</Label>
        <Input
          id="wallet-address"
          value={formData.walletAddress}
          onChange={(e) => handleInputChange("walletAddress", e.target.value)}
          placeholder="e.g., 0xA3f...bE22 (paste or connect wallet)"
          required
        />
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
        <h3 className="text-xl font-semibold mb-2">Step 3: Link Settings</h3>
        <p className="text-muted-foreground">Customize your payment link</p>
      </div>

      {/* Custom Link Name */}
      <div className="space-y-2">
        <Label htmlFor="custom-link">Custom Link Name (optional)</Label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            stablestack.com/pay/
          </span>
          <Input
            id="custom-link"
            value={formData.customLinkName}
            onChange={(e) =>
              handleInputChange("customLinkName", e.target.value)
            }
            placeholder="yourbrand.com/pay/hoodie"
            className="flex-1"
          />
        </div>
      </div>

      {/* Link Expiration */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Link Expiration (optional)
        </Label>
        <div className="space-y-2">
          {[
            { value: "never", label: "Never" },
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="expiration"
                value={option.value}
                checked={formData.expiration === option.value}
                onChange={(e) =>
                  handleInputChange("expiration", e.target.value)
                }
                className="w-4 h-4"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Buyer Notifications</Label>
        <div className="space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) =>
                handleInputChange("emailNotifications", e.target.checked)
              }
              className="w-4 h-4"
            />
            <Mail className="h-4 w-4" />
            <span>✅ Email confirmation</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.telegramNotifications}
              onChange={(e) =>
                handleInputChange("telegramNotifications", e.target.checked)
              }
              className="w-4 h-4"
            />
            <MessageSquare className="h-4 w-4" />
            <span>✅ Telegram DM (if enabled)</span>
          </label>
        </div>
      </div>
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
        <h3 className="text-xl font-semibold mb-2">
          Step 4: Review & Generate
        </h3>
        <p className="text-muted-foreground">
          Review your product link details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Product Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Product:</span>
              <div className="text-muted-foreground">
                {formData.name || "Not specified"}
              </div>
            </div>
            <div>
              <span className="font-medium">Price:</span>
              <div className="text-muted-foreground">
                ${formData.price || "0.00"}
              </div>
            </div>
            <div>
              <span className="font-medium">Receive In:</span>
              <div className="text-muted-foreground">
                {formData.payoutCurrency} (Base Network)
              </div>
            </div>
            <div>
              <span className="font-medium">Wallet:</span>
              <div className="text-muted-foreground font-mono text-xs">
                {formData.walletAddress
                  ? `${formData.walletAddress.slice(
                      0,
                      6
                    )}…${formData.walletAddress.slice(-4)}`
                  : "Not specified"}
              </div>
            </div>
            <div>
              <span className="font-medium">Image:</span>
              <div className="text-muted-foreground">
                {formData.imagePreview ? "🖼️ Uploaded" : "Not uploaded"}
              </div>
            </div>
            <div>
              <span className="font-medium">Expiration:</span>
              <div className="text-muted-foreground">
                {formData.expiration === "never"
                  ? "Never"
                  : `${formData.expiration} days`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Step 5: Success</h3>
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
          <div className="mt-4 sm:mt-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 min-w-max sm:min-w-0">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex items-center flex-shrink-0"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                        currentStep >= step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                        currentStep >= step.number
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 sm:w-8 h-px mx-2 sm:mx-4 transition-colors ${
                        currentStep > step.number ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-muted/50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            {currentStep < 5 && (
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
                currentStep === 5 ? "w-full" : "w-full sm:w-auto"
              }`}
            >
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 &&
                      (!formData.name || !formData.price)) ||
                    (currentStep === 2 && !formData.walletAddress)
                  }
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : currentStep === 4 ? (
                <Button
                  onClick={generateLink}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  {isGenerating ? (
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
