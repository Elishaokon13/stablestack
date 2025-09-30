"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUserSession } from "@/hooks/useUserSession"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react"

const onboardingFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
})

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>

export function OnboardingForm() {
  const { user, address, isAuthenticated, isLoading: isUserSessionLoading, needsOnboarding, refreshUser } = useUserSession()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      username: user?.username || "",
    },
  })

  const { handleSubmit, register, formState, reset } = form
  const { isSubmitting, errors } = formState

  React.useEffect(() => {
    if (user?.username) {
      reset({ username: user.username });
    }
  }, [user, reset]);

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!isAuthenticated || !address) {
      toast.error("You must be logged in to complete onboarding.")
      router.push("/test-wallet")
      return
    }

    try {
      console.log("Submitting onboarding with:", { address, username: values.username })
      
      // First, check if user exists
      const checkResponse = await fetch(`/api/users?walletAddress=${address}`)
      console.log("Check user response status:", checkResponse.status)
      
      let userExists = checkResponse.ok
      if (userExists) {
        console.log("User already exists, skipping creation")
      }
      
      // If user doesn't exist, create them
      if (!userExists) {
        console.log("User doesn't exist, creating...")
        const createResponse = await fetch('/api/users', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
          }),
        })

        console.log("Create user response status:", createResponse.status)
        
        if (!createResponse.ok) {
          let errorData = {}
          try {
            errorData = await createResponse.json()
          } catch (e) {
            errorData = { message: `HTTP ${createResponse.status}: ${createResponse.statusText}` }
          }
          console.error("Create user error:", errorData)
          // If user creation fails, we still try to update in case user exists
          // Don't throw here, just log and continue to update
        } else {
          userExists = true
          console.log("User created successfully")
        }
      }
      
      // Now update the user with onboarding data
      const updateResponse = await fetch(`/api/users?walletAddress=${address}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          isOnboardingComplete: true,
        }),
      })

      console.log("Update user response status:", updateResponse.status)
      
      if (!updateResponse.ok) {
        let errorData = {}
        try {
          errorData = await updateResponse.json()
        } catch (e) {
          errorData = { message: `HTTP ${updateResponse.status}: ${updateResponse.statusText}` }
        }
        console.error("API error response:", errorData)
        const errorMessage = errorData.message || errorData.error || `HTTP ${updateResponse.status}: Failed to complete onboarding`
        throw new Error(errorMessage)
      }

      const result = await updateResponse.json()
      console.log("API success response:", result)

      toast.success("Onboarding complete! Welcome to Stablestack!")
      setStep(2) // Move to success step
      refreshUser() // Refresh user session from database
    } catch (error: any) {
      console.error("Onboarding submission error:", error)
      toast.error(error.message || "An unexpected error occurred.")
    }
  }

  if (isUserSessionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-primary-foreground">Not Authenticated</h3>
        <p className="text-muted-foreground mt-2">Please connect your wallet to start onboarding.</p>
        <Button onClick={() => router.push("/test-wallet")} className="mt-6" style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}>
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!needsOnboarding && step === 1) {
    return (
      <div className="text-center p-8">
        <CheckCircle2 className="mx-auto w-12 h-12 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-primary-foreground">Onboarding Already Complete!</h3>
        <p className="text-muted-foreground mt-2">You can now access all dashboard features.</p>
        <Button 
          onClick={() => {
            console.log("Dashboard button clicked (already complete)!")
            router.push("/dashboard")
          }} 
          className="mt-6" 
          style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
        >
          Go to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 p-6 bg-card rounded-lg shadow-lg ring-2 ring-pop"
      style={{ pointerEvents: 'auto' }}
    >
      {step === 1 && (
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
            <h2 className="text-2xl font-display text-primary-foreground">Welcome to Stablestack!</h2>
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
            className="w-full"
            disabled={isSubmitting}
            style={{ background: 'linear-gradient(to bottom, #ff6d41, #ff5420)' }}
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
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
          style={{ pointerEvents: 'auto' }}
        >
          <CheckCircle2 className="mx-auto w-16 h-16 text-green-500" />
          <h2 className="text-3xl font-display text-primary-foreground">Onboarding Complete!</h2>
          <p className="text-muted-foreground">You're all set. Start creating products and accepting payments!</p>
          <Button 
            onClick={() => {
              console.log("Dashboard button clicked!")
              router.push("/dashboard")
            }} 
            className="w-full cursor-pointer" 
            style={{ 
              background: 'linear-gradient(to bottom, #ff6d41, #ff5420)',
              pointerEvents: 'auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}