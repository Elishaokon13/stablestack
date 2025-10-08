"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CallbackPage() {
  const { getToken, userId, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const sendTokenToBackend = async () => {
      try {
        // Wait for auth to load
        if (!authLoaded || !userLoaded) {
          return;
        }

        // Check if user is authenticated
        if (!userId || !user) {
          setStatus("error");
          setMessage("User not authenticated");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        setMessage("Getting authentication token...");

        // Get the token from Clerk
        const token = await getToken();

        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        // Console log the Clerk authentication token
        console.log("ClerkAuth (http, Bearer):", token);

        setMessage("Sending token to backend...");

        // Send token to backend
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            imageUrl: user.imageUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Backend request failed");
        }

        const data = await response.json();
        console.log("Backend response:", data);

        setStatus("success");
        setMessage("Authentication successful! Redirecting to dashboard...");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Authentication failed"
        );

        // Redirect to home after 3 seconds on error
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    sendTokenToBackend();
  }, [authLoaded, userLoaded, userId, user, getToken, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="w-16 h-16 text-green-400" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-red-400" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            {status === "loading" && "Processing Authentication"}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Error"}
          </h1>

          {/* Message */}
          <p className="text-purple-200 mb-6">{message}</p>

          {/* Progress indicator for loading */}
          {status === "loading" && (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
            </div>
          )}

          {/* Additional info */}
          {status === "error" && (
            <p className="text-sm text-gray-400 mt-4">
              Redirecting you back to login...
            </p>
          )}
          {status === "success" && (
            <p className="text-sm text-gray-400 mt-4">
              Taking you to the dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
