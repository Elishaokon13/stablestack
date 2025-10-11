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
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            {status === "loading" && "Verifying Authentication"}
            {status === "success" && "Success!"}
          </h1>

          {/* Message */}
          <p className="text-purple-200 mb-6">
            {status === "loading" && "Please wait..."}
            {status === "success" && "Redirecting to dashboard..."}
          </p>

          {/* Progress indicator */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
