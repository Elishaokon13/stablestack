"use client";

import React, { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen !bg-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003e91]/40 border-t-[#003e91] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (userId) {
    return null;
  }

  return (
    <div className="min-h-screen !bg-[#ffffff] relative overflow-hidden">
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl items-center">
          {/* Tabs */}
          <div className="flex justify-center mb-4">
            <div className="bg-black border border-white/20 rounded-xl p-1.5 flex gap-1">
              <button
                onClick={() => setActiveTab("signup")}
                className={`px-8 py-2 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setActiveTab("signin")}
                className={`px-8 py-3 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === "signin"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Auth Components */}
          <div className="flex justify-center">
            {activeTab === "signup" ? (
              <SignUp  fallbackRedirectUrl="/dashboard" />
            ) : (
              <SignIn fallbackRedirectUrl="/dashboard" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
