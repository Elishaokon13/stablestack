#!/usr/bin/env node

// Simple script to check Stripe configuration
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Stripe Configuration...\n');

// Check required environment variables
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

const optionalVars = [
  'STRIPE_DEFAULT_CURRENCY',
  'STRIPE_API_VERSION',
  'STRIPE_WEBHOOK_ENDPOINT',
  'BLOCKRADAR_API_KEY',
  'BLOCKRADAR_WALLET_ID'
];

console.log('✅ Required Configuration:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 20)}...` : 'Not set';
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

console.log('\n🔧 Optional Configuration:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const displayValue = value ? `${value.substring(0, 20)}...` : 'Not set';
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

// Check if using live keys
const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
console.log(`\n🌐 Mode: ${isLiveMode ? 'LIVE' : 'TEST'}`);

// Recommendations
console.log('\n📋 Recommendations:');
if (!process.env.STRIPE_DEFAULT_CURRENCY) {
  console.log('• Set STRIPE_DEFAULT_CURRENCY=usd for consistency');
}
if (!process.env.BLOCKRADAR_API_KEY) {
  console.log('• Configure BLOCKRADAR_API_KEY for stablecoin management');
}
if (!process.env.BLOCKRADAR_WALLET_ID) {
  console.log('• Configure BLOCKRADAR_WALLET_ID for receiving stablecoins');
}
if (!process.env.STRIPE_WEBHOOK_ENDPOINT) {
  console.log('• Set STRIPE_WEBHOOK_ENDPOINT for production webhooks');
}

console.log('\n✨ Your current setup is sufficient for basic payment processing!');
console.log('💡 Consider adding the optional configurations for enhanced functionality.');







