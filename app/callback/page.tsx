"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export default function CallbackPage() {
  const { userId, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for auth to load
      if (!authLoaded || !userLoaded) {
        return;
      }

      // Check if user is authenticated
      if (!userId || !user) {
        router.push("/");
        return;
      }

      // User is authenticated, redirect to dashboard
      setStatus("success");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    };

    handleCallback();
  }, [authLoaded, userLoaded, userId, user, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {status === "loading" && "Verifying Authentication"}
            {status === "success" && "Success!"}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            {status === "loading" && "Please wait..."}
            {status === "success" && "Redirecting to dashboard..."}
          </p>

          {/* Progress indicator */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
