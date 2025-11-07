"use client";

import React, { useState } from "react";
import { useCreatePaymentLink } from "@/lib/hooks/product/use-create-product";
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
  const {
    createPaymentLink,
    loading: isCreatingLink,
    error: createError,
  } = useCreatePaymentLink();
  const [currentStep, setCurrentStep] = useState(1);
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

    try {
      const payload = {
        type: "product" as const,
        name: formData.title,
        description: formData.description,
        amount: formData.amount || "0",
        currency: formData.currency.toLowerCase(),
        purpose: formData.purpose || "product",
        expiresIn: formData.expiresIn,
        allowMultiplePayments: formData.allowMultiplePayments,
        payoutChain: "base-sepolia",
        payoutToken: "USDC",
        slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
      };

      const paymentLink = await createPaymentLink(payload);

      if (paymentLink) {
        setCreatedLink(paymentLink.paymentLink);
        toast.success("Payment link created successfully!");

        if (onSuccess) {
          onSuccess({
            link: paymentLink.paymentLink,
            id: paymentLink.id,
            slug: paymentLink.slug,
            ...formData,
          });
        }
      } else {
        toast.error(createError || "Failed to create payment link");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create payment link"
      );
      console.error("Error creating payment link:", error);
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
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Payment Amount
        </h3>
        <p className="text-gray-600">How much do you want to charge?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-foreground font-medium">
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
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-foreground font-medium">
            Currency *
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-success/20">
          <CreditCard className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Payment Details
        </h3>
        <p className="text-gray-600">What is this payment for?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-medium">
            Payment Title *
          </Label>
          <Input
            id="title"
            placeholder="e.g., Website Development, Consulting Session"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-foreground font-medium">
            Purpose
          </Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) => handleInputChange("purpose", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {purposeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <Link className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Description</h3>
        <p className="text-gray-600">
          Add more details about this payment (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what this payment is for, any special instructions, or additional details..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="min-h-[120px]"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Payment Settings
        </h3>
        <p className="text-gray-600">Configure your payment link</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expiresIn" className="text-foreground font-medium">
            Expires In
          </Label>
          <Select
            value={formData.expiresIn}
            onValueChange={(value) => handleInputChange("expiresIn", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expiresOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Payment Options</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={formData.allowMultiplePayments}
                onChange={(e) =>
                  handleInputChange("allowMultiplePayments", e.target.checked)
                }
                className="rounded border-gray-300 bg-white text-primary focus:ring-primary"
              />
              <div>
                <Label
                  htmlFor="allowMultiple"
                  className="text-foreground font-medium"
                >
                  Allow multiple payments
                </Label>
                <p className="text-sm text-gray-500">
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
      <DialogContent
        className="max-w-lg mx-auto bg-white border border-gray-200 text-foreground max-h-[90vh] overflow-y-auto shadow-xl"
        overlayClassName="bg-black/40 backdrop-blur-0"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Create Payment Link
          </DialogTitle>

          {/* Progress Indicator */}
          {!createdLink && (
            <div className="mt-6">
              <div className="flex items-center justify-between relative">
                {/* Connecting Lines */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Step Indicators */}
                {[
                  { number: 1, label: "Amount" },
                  { number: 2, label: "Details" },
                  { number: 3, label: "Description" },
                  { number: 4, label: "Settings" },
                ].map((step) => {
                  const stepNumber = step.number;
                  const isCompleted = stepNumber < currentStep;
                  const isCurrent = stepNumber === currentStep;

                  return (
                    <div
                      key={stepNumber}
                      className="flex flex-col items-center relative z-10"
                    >
                      {/* Step Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          isCompleted
                            ? "bg-primary text-white shadow-md"
                            : isCurrent
                            ? "bg-primary text-white ring-4 ring-primary/20 shadow-lg scale-110"
                            : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          stepNumber
                        )}
                      </div>
                      {/* Step Label */}
                      <span
                        className={`mt-2 text-xs font-medium transition-colors ${
                          isCurrent
                            ? "text-primary font-semibold"
                            : isCompleted
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogHeader>

        {!createdLink ? (
          <div className="space-y-6">
            {/* Error Message */}
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isCreatingLink}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isCreatingLink ? (
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
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Payment Link Created!
              </h3>
              <p className="text-gray-600">
                Your payment link is ready to share
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Label className="text-foreground font-medium mb-2 block">
                Payment Link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={createdLink}
                  readOnly
                  className="bg-white border-gray-200 font-mono text-sm text-gray-700"
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
                <p className="text-gray-500">Amount</p>
                <p className="text-foreground font-semibold">
                  {formData.currency} {formData.amount}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Purpose</p>
                <p className="text-foreground font-semibold">
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
                className="flex-1"
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
