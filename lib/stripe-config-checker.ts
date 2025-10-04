import { getStripeServer } from './stripe';

export interface StripeConfigStatus {
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  hasWebhookSecret: boolean;
  isLiveMode: boolean;
  canCreatePaymentIntents: boolean;
  canCreateCheckoutSessions: boolean;
  webhookEndpointConfigured: boolean;
  recommendedSettings: string[];
}

export async function checkStripeConfiguration(): Promise<StripeConfigStatus> {
  const status: StripeConfigStatus = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    isLiveMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false,
    canCreatePaymentIntents: false,
    canCreateCheckoutSessions: false,
    webhookEndpointConfigured: false,
    recommendedSettings: [],
  };
  console.log('status', status);
  // Test API connectivity
  try {
    if (status.hasSecretKey) {
      // Test Payment Intents API
      const stripe = getStripeServer();
      const testPaymentIntent = await stripe.paymentIntents.create({
        amount: 100, // $1.00 test
        currency: 'usd',
        metadata: { test: 'configuration_check' },
      });
      status.canCreatePaymentIntents = true;
    }
  } catch (error) {
    status.recommendedSettings.push('Verify STRIPE_SECRET_KEY is valid');
  }

  try {
    if (status.hasSecretKey) {
      // Test Checkout Sessions API
      const stripe = getStripeServer();
      const testSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Test Product' },
            unit_amount: 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      });
      status.canCreateCheckoutSessions = true;
    }
  } catch (error) {
    status.recommendedSettings.push('Verify Stripe API permissions');
  }

  // Check webhook configuration
  if (status.hasWebhookSecret) {
    status.webhookEndpointConfigured = true;
  } else {
    status.recommendedSettings.push('Configure STRIPE_WEBHOOK_SECRET for payment verification');
  }

  // Additional recommendations
  if (!process.env.STRIPE_DEFAULT_CURRENCY) {
    status.recommendedSettings.push('Set STRIPE_DEFAULT_CURRENCY=usd for consistency');
  }

  if (!process.env.STRIPE_API_VERSION) {
    status.recommendedSettings.push('Set STRIPE_API_VERSION for API stability');
  }

  if (!process.env.STRIPE_WEBHOOK_ENDPOINT) {
    status.recommendedSettings.push('Set STRIPE_WEBHOOK_ENDPOINT for production webhooks');
  }

  if (!process.env.BLOCKRADAR_API_KEY) {
    status.recommendedSettings.push('Configure BLOCKRADAR_API_KEY for stablecoin management');
  }

  if (!process.env.BLOCKRADAR_WALLET_ID) {
    status.recommendedSettings.push('Configure BLOCKRADAR_WALLET_ID for receiving stablecoins');
  }

  return status;
}

export function getStripeConfigurationSummary(status: StripeConfigStatus): string {
  const summary = [];
  
  summary.push('🔧 Stripe Configuration Status:');
  summary.push(`✅ Secret Key: ${status.hasSecretKey ? 'Configured' : '❌ Missing'}`);
  summary.push(`✅ Publishable Key: ${status.hasPublishableKey ? 'Configured' : '❌ Missing'}`);
  summary.push(`✅ Webhook Secret: ${status.hasWebhookSecret ? 'Configured' : '❌ Missing'}`);
  summary.push(`🌐 Mode: ${status.isLiveMode ? 'Live' : 'Test'}`);
  summary.push(`💳 Payment Intents: ${status.canCreatePaymentIntents ? '✅ Working' : '❌ Failed'}`);
  summary.push(`🛒 Checkout Sessions: ${status.canCreateCheckoutSessions ? '✅ Working' : '❌ Failed'}`);
  
  if (status.recommendedSettings.length > 0) {
    summary.push('\n📋 Recommended Additional Settings:');
    status.recommendedSettings.forEach((setting: any) => {
      summary.push(`• ${setting}`);
    });
  }
  
  return summary.join('\n');
}
