'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomPaymentForm from '@/components/payment/custom-payment-form';
import PaymentLinkGenerator from '@/components/payment/payment-link-generator';
import { CreditCard, Link, Zap, Shield, CheckCircle } from 'lucide-react';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'generator'>('form');

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">StableStack Demo</h1>
          <p className="text-xl text-muted-foreground">
            Custom UI with Stripe Integration
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>PCI Compliant</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Stripe Powered</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Real-time</span>
            </Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Custom Payment Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fully customizable payment forms using Stripe Elements with your own branding and styling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Payment Link Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create shareable payment links for products or general payments with automatic stablecoin conversion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Real-time Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Instant payment processing with automatic webhook handling and stablecoin disbursement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'form' | 'generator')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Custom Payment Form</TabsTrigger>
            <TabsTrigger value="generator">Payment Link Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Custom Payment Form Demo</h2>
              <p className="text-muted-foreground">
                Try the custom payment form with Stripe Elements integration
              </p>
            </div>
            
            <div className="flex justify-center">
              <CustomPaymentForm
                amount={29.99}
                currency="usd"
                productName="Premium Subscription"
                description="Monthly premium subscription with full access"
                onSuccess={(paymentIntentId) => {
                  console.log('Payment successful:', paymentIntentId);
                  alert('Payment successful! (Demo mode)');
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                  alert('Payment failed: ' + error);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Payment Link Generator Demo</h2>
              <p className="text-muted-foreground">
                Create and manage payment links for your products
              </p>
            </div>
            
            <PaymentLinkGenerator />
          </TabsContent>
        </Tabs>

        {/* Integration Details */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
            <CardDescription>
              How the custom UI integrates with Stripe while maintaining security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Frontend (Custom UI)</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Stripe Elements for secure card input</li>
                  <li>• Custom styling and branding</li>
                  <li>• Real-time validation and error handling</li>
                  <li>• Responsive design for all devices</li>
                  <li>• Loading states and user feedback</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Backend (Stripe API)</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Payment Intents API for secure processing</li>
                  <li>• Webhook handling for real-time updates</li>
                  <li>• Automatic stablecoin conversion</li>
                  <li>• PCI compliance maintained</li>
                  <li>• Fraud protection and security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

