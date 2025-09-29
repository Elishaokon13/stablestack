'use client';

import { useState } from 'react';
import { PaymentForm } from '@/components/payment/payment-form';
import { WalletDashboard } from '@/components/wallet/wallet-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PaymentStep = 'amount' | 'payment' | 'processing' | 'success' | 'wallet';

export default function PaymentFlowPage() {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('amount');
  const [amount, setAmount] = useState<number>(100);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('user_123'); // In real app, this would come from auth

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      setCurrentStep('payment');
      setError(null);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setCurrentStep('processing');
    
    // Simulate processing time
    setTimeout(() => {
      setCurrentStep('success');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const resetFlow = () => {
    setCurrentStep('amount');
    setPaymentIntentId(null);
    setError(null);
  };

  const viewWallet = () => {
    setCurrentStep('wallet');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stripe + Blockradar Integration
          </h1>
          <p className="text-gray-600">
            Complete payment and crypto disbursement flow
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['amount', 'payment', 'processing', 'success'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    ['amount', 'payment', 'processing', 'success'].indexOf(currentStep) >= index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium capitalize">{step}</span>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="amount">Amount</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="amount" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Enter Payment Amount</CardTitle>
                <CardDescription>
                  Specify the amount you want to pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAmountSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      min="0.01"
                      step="0.01"
                      placeholder="100.00"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="max-w-md mx-auto">
              <PaymentForm
                amount={amount}
                currency="usd"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Processing Payment</CardTitle>
                <CardDescription>
                  Your payment is being processed and crypto payout is being prepared
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Processing Stripe payment...
                  </p>
                  <p className="text-sm text-gray-600">
                    Preparing crypto disbursement...
                  </p>
                  <p className="text-sm text-gray-600">
                    Creating Blockradar transaction...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="success" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-green-600">Payment Successful!</CardTitle>
                <CardDescription>
                  Your payment has been processed and crypto payout initiated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Payment ID:</span>
                    <span className="text-sm font-mono">{paymentIntentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button onClick={viewWallet} className="w-full">
                    View Wallet Dashboard
                  </Button>
                  <Button onClick={resetFlow} variant="outline" className="w-full">
                    Make Another Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Wallet Dashboard
                </h2>
                <p className="text-gray-600">
                  Manage your crypto wallet and view transaction history
                </p>
              </div>
              
              <WalletDashboard userId={userId} />
              
              <div className="text-center">
                <Button onClick={resetFlow} variant="outline">
                  Back to Payment Flow
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
            <CardDescription>
              This demo showcases the complete Stripe + Blockradar integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Stripe Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payment Intents API</li>
                  <li>• Webhook handling</li>
                  <li>• Card payment processing</li>
                  <li>• 3DS authentication</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Blockradar Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wallet management</li>
                  <li>• Transaction creation</li>
                  <li>• Balance monitoring</li>
                  <li>• Crypto disbursements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
