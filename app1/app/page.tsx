"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Package, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Secure wallet connection with Reown",
      action: () => router.push("/test-wallet"),
      buttonText: "Connect Wallet"
    },
    {
      icon: Package,
      title: "Manage Products",
      description: "Create and manage your products",
      action: () => router.push("/products"),
      buttonText: "View Products"
    },
    {
      icon: DollarSign,
      title: "Accept Payments",
      description: "Receive USDC payments on Base",
      action: () => router.push("/dashboard"),
      buttonText: "Go to Dashboard"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your sales and earnings",
      action: () => router.push("/analytics"),
      buttonText: "View Analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            M.O.N.K.Y OS
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate rebel payment platform for Web3. Accept USDC payments with style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/test-wallet")}
              size="lg"
              className="px-8 py-3"
              style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="h-full bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <Button
                    onClick={feature.action}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: '#ff5941', color: '#ff5941' }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mt-16 text-gray-400"
        >
          <p>Powered by Reown • Built on Base • Secure • Global</p>
        </motion.div>
      </div>
    </div>
  );
}