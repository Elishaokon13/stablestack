"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { User as UserIcon, CheckCircle2 } from "lucide-react";

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 p-6 bg-card rounded-lg shadow-lg ring-2 ring-pop"
      style={{ pointerEvents: "auto" }}
    >
      {/* {step === 1 && (
        <motion.form
          key="step1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="text-center">
            <UserIcon className="mx-auto w-12 h-12 text-primary mb-4" style={{ color: '#ff5941' }} />
            <h2 className="text-2xl font-display text-primary-foreground">Welcome to Openly!</h2>
            <p className="text-muted-foreground mt-2">Let's set up your profile to get started.</p>
          </div>

          <div>
            <Label htmlFor="username" className="text-muted-foreground">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="cyber_rebel_01"
              className="mt-1"
            />
            {errors.username && (
              <p className="text-destructive text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Onboarding
              </>
            )}
          </Button>
        </motion.form>
      )} */}

      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
          style={{ pointerEvents: "auto" }}
        >
          <CheckCircle2 className="mx-auto w-16 h-16 text-green-500" />
          <h2 className="text-3xl font-display text-primary-foreground">
            Onboarding Complete!
          </h2>
          <p className="text-muted-foreground">
            You're all set. Start creating products and accepting payments!
          </p>
          <Button
            onClick={() => {
              router.push("/dashboard");
            }}
            className="w-full cursor-pointer bg-primary hover:bg-primary/90 pointer-events-auto relative z-10"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
