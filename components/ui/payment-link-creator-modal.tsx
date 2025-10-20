"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  DollarSign,
  Link,
  Copy,
  CheckCircle,
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentLinkCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentLink: any) => void;
}

interface PaymentLinkData {
  amount: string;
  currency: string;
  title: string;
  description: string;
  purpose: string;
  expiresIn: string;
  allowMultiplePayments: boolean;
}

export function PaymentLinkCreatorModal({
  isOpen,
  onClose,
  onSuccess,
}: PaymentLinkCreatorModalProps) {
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentLinkData>({
    amount: "",
    currency: "USD",
    title: "",
    description: "",
    purpose: "",
    expiresIn: "7",
    allowMultiplePayments: false,
  });

  const totalSteps = 4;

  const handleInputChange = (
    field: keyof PaymentLinkData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.amount && formData.currency;
      case 2:
        return formData.title;
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Settings
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Call the actual API to create payment link
      const response = await fetch("/api/payment-links/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "product", // Using product type for one-time payments
          name: formData.title,
          description: formData.description,
          amount: parseFloat(formData.amount),
          currency: formData.currency.toLowerCase(),
          purpose: formData.purpose,
          expiresIn: formData.expiresIn,
          allowMultiplePayments: formData.allowMultiplePayments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment link");
      }

      const result = await response.json();
      setCreatedLink(result.url);

      toast.success("Payment link created successfully!");

      if (onSuccess) {
        onSuccess({
          link: result.url,
          id: result.id,
          slug: result.slug,
          ...formData,
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create payment link"
      );
      console.error("Error creating payment link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      toast.success("Payment link copied to clipboard!");
    }
  };

  const handleClose = () => {
    setCreatedLink(null);
    setCurrentStep(1);
    setFormData({
      amount: "",
      currency: "USD",
      title: "",
      description: "",
      purpose: "",
      expiresIn: "7",
      allowMultiplePayments: false,
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderAmountStep();
      case 2:
        return renderDetailsStep();
      case 3:
        return renderDescriptionStep();
      case 4:
        return renderSettingsStep();
      default:
        return null;
    }
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Amount</h3>
        <p className="text-gray-300">How much do you want to charge?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-white font-medium">
            Amount *
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-white font-medium">
            Currency *
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange("currency", value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {currencyOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-success/20">
          <CreditCard className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
        <p className="text-gray-300">What is this payment for?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white font-medium">
            Payment Title *
          </Label>
          <Input
            id="title"
            placeholder="e.g., Website Development, Consulting Session"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-white font-medium">
            Purpose
          </Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) => handleInputChange("purpose", value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {purposeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderDescriptionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <Link className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Description</h3>
        <p className="text-gray-300">
          Add more details about this payment (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what this payment is for, any special instructions, or additional details..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px]"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Settings</h3>
        <p className="text-gray-300">Configure your payment link</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expiresIn" className="text-white font-medium">
            Expires In
          </Label>
          <Select
            value={formData.expiresIn}
            onValueChange={(value) => handleInputChange("expiresIn", value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {expiresOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white font-medium">Payment Options</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={formData.allowMultiplePayments}
                onChange={(e) =>
                  handleInputChange("allowMultiplePayments", e.target.checked)
                }
                className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <Label
                  htmlFor="allowMultiple"
                  className="text-white font-medium"
                >
                  Allow multiple payments
                </Label>
                <p className="text-sm text-gray-400">
                  Let customers pay multiple times with the same link
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ];

  const purposeOptions = [
    { value: "service", label: "Service Payment" },
    { value: "product", label: "Product Purchase" },
    { value: "donation", label: "Donation" },
    { value: "subscription", label: "Subscription" },
    { value: "event", label: "Event Registration" },
    { value: "consultation", label: "Consultation" },
    { value: "other", label: "Other" },
  ];

  const expiresOptions = [
    { value: "1", label: "1 day" },
    { value: "3", label: "3 days" },
    { value: "7", label: "1 week" },
    { value: "14", label: "2 weeks" },
    { value: "30", label: "1 month" },
    { value: "90", label: "3 months" },
    { value: "never", label: "Never expires" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl mx-auto bg-[#111111] backdrop-blur-lg border border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Create Payment Link
          </DialogTitle>

          {/* Progress Indicator */}
          {!createdLink && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i + 1 <= currentStep
                      ? "bg-primary text-white ring-2 ring-primary/30"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {!createdLink ? (
          <div className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-white/10">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Link...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Create Payment Link
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Payment Link Created!
              </h3>
              <p className="text-gray-300">
                Your payment link is ready to share
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <Label className="text-white font-medium mb-2 block">
                Payment Link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={createdLink}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-white font-semibold">
                  {formData.currency} {formData.amount}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Purpose</p>
                <p className="text-white font-semibold">
                  {formData.purpose || "General"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                Done
              </Button>
              <Button
                onClick={() => setCreatedLink(null)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Create Another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
