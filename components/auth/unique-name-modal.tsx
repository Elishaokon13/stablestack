"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUniqueName } from "@/lib/hooks/unique-name/use-unique-name";
import { useCheckUniqueName } from "@/lib/hooks/unique-name/use-check-unique-name";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function UniqueNameModal() {
  const { uniqueName, loading: fetchingName, setUniqueName } = useUniqueName();
  const { loading: checking, result, checkAvailability } = useCheckUniqueName();
  
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show modal if user doesn't have a unique name
  useEffect(() => {
    if (!fetchingName && uniqueName === null) {
      setOpen(true);
    }
  }, [uniqueName, fetchingName]);

  // Debounce input for checking availability
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Check availability when debounced value changes
  useEffect(() => {
    if (debouncedValue.length >= 3) {
      checkAvailability(debouncedValue);
    }
  }, [debouncedValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    if (inputValue.length < 3) {
      setError("Unique name must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(inputValue)) {
      setError("Only letters, numbers, hyphens, and underscores allowed");
      return;
    }

    // Check if available
    if (result && !result.available) {
      setError(result.reason || "This name is not available");
      return;
    }

    setSaving(true);
    try {
      const response = await setUniqueName(inputValue);
      if (response) {
        setOpen(false);
      } else {
        setError("Failed to set unique name. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInputStatus = () => {
    if (!inputValue) return null;
    if (inputValue.length < 3) return { icon: XCircle, text: "Too short (min 3 characters)", color: "text-red-500" };
    if (!/^[a-zA-Z0-9_-]+$/.test(inputValue)) return { icon: XCircle, text: "Invalid characters", color: "text-red-500" };
    if (checking) return { icon: Loader2, text: "Checking...", color: "text-blue-500", spin: true };
    if (result?.available) return { icon: CheckCircle2, text: "Available!", color: "text-green-500" };
    if (result && !result.available) return { icon: XCircle, text: result.reason || "Not available", color: "text-red-500" };
    return null;
  };

  const status = getInputStatus();
  const canSubmit = inputValue.length >= 3 && result?.available && !saving && !checking;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome! 🎉</DialogTitle>
          <DialogDescription className="text-base">
            Let's get you set up with a unique name. This will be used for your payment links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uniqueName" className="text-sm font-medium">
              Choose Your Unique Name
            </Label>
            <Input
              id="uniqueName"
              placeholder="e.g. johndoe or my-store"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
              className="text-base"
              autoFocus
              disabled={saving}
            />
            
            {/* Status indicator */}
            {status && (
              <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                {status.spin ? (
                  <status.icon className="h-4 w-4 animate-spin" />
                ) : (
                  <status.icon className="h-4 w-4" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Example URL */}
            {inputValue && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Your payment links will look like:</p>
                <code className="text-sm font-mono break-all">
                  {window.location.origin}/{inputValue}/your-product
                </code>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You can always change this later in settings
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

