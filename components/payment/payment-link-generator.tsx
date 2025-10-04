'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomPaymentForm from './custom-payment-form';
import { ProductForm } from '@/components/forms/Product';
import { ProductLinkModal } from './product-link-modal';
import { Link, Copy, ExternalLink, DollarSign, Package, Plus } from 'lucide-react';

interface PaymentLink {
  id: string;
  type: 'product' | 'general';
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  url: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

interface PaymentLinkFormProps {
  onSuccess?: (link: PaymentLink) => void;
  onCancel?: () => void;
}

function PaymentLinkForm({ onSuccess, onCancel }: PaymentLinkFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [linkType, setLinkType] = useState<'product' | 'general'>('product');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'usd',
  });

  const generatePaymentLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: linkType,
          name: formData.name,
          description: formData.description,
          amount: linkType === 'product' ? parseFloat(formData.amount) : undefined,
          currency: formData.currency,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment link');
      }

      // Create new link object
      const newLink: PaymentLink = {
        id: result.id,
        type: linkType,
        name: formData.name,
        description: formData.description,
        amount: linkType === 'product' ? parseFloat(formData.amount) : undefined,
        currency: formData.currency,
        url: result.url,
        createdAt: new Date(),
        status: 'active',
      };

      // Reset form
      setFormData({
        name: '',
        description: '',
        amount: '',
        currency: 'usd',
      });

      if (onSuccess) {
        onSuccess(newLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Link Type Selection */}
      <div className="space-y-4">
        <Label>Link Type</Label>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={linkType === 'product' ? 'default' : 'outline'}
            onClick={() => setLinkType('product')}
            className="h-20 flex flex-col space-y-2"
          >
            <Package className="h-6 w-6" />
            <span>Product Link</span>
            <span className="text-xs text-muted-foreground">
              Fixed price for specific product
            </span>
          </Button>
          <Button
            variant={linkType === 'general' ? 'default' : 'outline'}
            onClick={() => setLinkType('general')}
            className="h-20 flex flex-col space-y-2"
          >
            <DollarSign className="h-6 w-6" />
            <span>General Payment</span>
            <span className="text-xs text-muted-foreground">
              Flexible amount payment
            </span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Link Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Premium Subscription, Donation, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description for your customers"
            rows={3}
          />
        </div>

        {linkType === 'product' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="cad">CAD</option>
              </select>
            </div>
          </div>
        )}

        {linkType === 'general' && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              General payment links allow customers to enter any amount they want to pay.
              You'll receive the payment in your stablecoin wallet automatically.
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={generatePaymentLink}
          disabled={!formData.name || (linkType === 'product' && !formData.amount) || isGenerating}
          className="flex-1"
          size="lg"
        >
          {isGenerating ? 'Generating...' : 'Generate Payment Link'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isGenerating}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PaymentLinkGenerator() {
  const [activeTab, setActiveTab] = useState<'create' | 'links'>('create');
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  
  // Modal states
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductLinkModalOpen, setIsProductLinkModalOpen] = useState(false);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Payment Link Generator</h1>
        <p className="text-muted-foreground">
          Create shareable payment links for products or general payments
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Payment Link Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Create Payment Link</span>
              </CardTitle>
              <CardDescription>
                Generate a shareable payment link for your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setIsProductLinkModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Product Link
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Product Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Create Product</span>
              </CardTitle>
              <CardDescription>
                Add a new product to your catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your catalog
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm 
                    onSuccess={() => {
                      setIsProductModalOpen(false);
                    }}
                    onCancel={() => setIsProductModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'links')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Link</TabsTrigger>
          <TabsTrigger value="links">My Links</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="text-center py-12">
            <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Payment Links</h3>
            <p className="text-muted-foreground mb-4">
              Use the buttons above to create payment links or products
            </p>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          {paymentLinks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment Links Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first payment link to get started
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Payment Link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paymentLinks.map((link) => (
                <Card key={link.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{link.name}</h3>
                          <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                            {link.status}
                          </Badge>
                          <Badge variant="outline">
                            {link.type === 'product' ? 'Product' : 'General'}
                          </Badge>
                        </div>
                        
                        {link.description && (
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        )}
                        
                        {link.amount && (
                          <p className="text-sm font-medium">
                            ${link.amount.toFixed(2)} {link.currency.toUpperCase()}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Created: {link.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(link.url)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Link Modal */}
      <ProductLinkModal
        isOpen={isProductLinkModalOpen}
        onClose={() => setIsProductLinkModalOpen(false)}
        onSuccess={(link) => {
          setPaymentLinks(prev => [link, ...prev]);
          setActiveTab('links');
        }}
      />
    </div>
  );
}

