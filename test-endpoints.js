#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all 35 implemented endpoints systematically
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  baseUrl: BASE_URL,
  timeout: 10000,
  verbose: true,
};

// Test data
const TEST_DATA = {
  userId: 'test_user_123',
  clerkId: 'user_2abc123def456',
  sellerId: 'seller_123',
  buyerId: 'buyer_456',
  productId: 'product_789',
  paymentId: 'payment_101',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  blockradarWalletId: 'wallet_abc123',
  stripePaymentIntentId: 'pi_test_1234567890',
  transactionId: 'txn_abc123def456',
};

// Utility functions
async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      url,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      url,
    };
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
};

function logTest(name, result, expectedStatus = 200) {
  const passed = result.ok && (result.status === expectedStatus || result.status < 400);
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name} - PASSED (${result.status})`);
  } else {
    testResults.failed++;
    testResults.errors.push(`${name}: ${result.error || result.data?.error || 'Unknown error'}`);
    console.log(`❌ ${name} - FAILED (${result.status})`);
    if (TEST_CONFIG.verbose) {
      console.log(`   Error: ${result.error || result.data?.error || 'Unknown error'}`);
      console.log(`   URL: ${result.url}`);
    }
  }
  
  testResults.details.push({
    name,
    passed,
    status: result.status,
    error: result.error || result.data?.error,
    url: result.url,
  });
}

// Test categories
const tests = {
  // 1. Authentication & User Management
  auth: [
    {
      name: 'GET /api/user/profile',
      method: 'GET',
      endpoint: `/api/user/profile?userId=${TEST_DATA.userId}`,
    },
    {
      name: 'PUT /api/user/profile',
      method: 'PUT',
      endpoint: '/api/user/profile',
      data: {
        userId: TEST_DATA.userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    },
    {
      name: 'GET /api/user/wallet',
      method: 'GET',
      endpoint: `/api/user/wallet?userId=${TEST_DATA.userId}`,
    },
  ],

  // 2. Payment Processing (Stripe)
  payments: [
    {
      name: 'POST /api/payments/create-intent',
      method: 'POST',
      endpoint: '/api/payments/create-intent',
      data: {
        amount: 1000, // $10.00
        currency: 'usd',
        metadata: {
          productName: 'Test Product',
          customerEmail: 'test@example.com',
        },
      },
    },
    {
      name: 'GET /api/payments/status',
      method: 'GET',
      endpoint: `/api/payments/status?paymentId=${TEST_DATA.paymentId}`,
    },
    {
      name: 'GET /api/payments/history',
      method: 'GET',
      endpoint: `/api/payments/history?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'POST /api/payments/refund',
      method: 'POST',
      endpoint: '/api/payments/refund',
      data: {
        paymentId: TEST_DATA.paymentId,
        amount: 500, // $5.00
        reason: 'requested_by_customer',
      },
    },
  ],

  // 3. Crypto Operations (Blockradar)
  crypto: [
    {
      name: 'POST /api/wallets/create',
      method: 'POST',
      endpoint: '/api/wallets/create',
      data: {
        userId: TEST_DATA.userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    {
      name: 'GET /api/wallets/balance',
      method: 'GET',
      endpoint: `/api/wallets/balance?userId=${TEST_DATA.userId}`,
    },
    {
      name: 'GET /api/wallets/transactions',
      method: 'GET',
      endpoint: `/api/wallets/transactions?userId=${TEST_DATA.userId}`,
    },
    {
      name: 'POST /api/payouts/initiate',
      method: 'POST',
      endpoint: '/api/payouts/initiate',
      data: {
        paymentId: TEST_DATA.paymentId,
        sellerId: TEST_DATA.sellerId,
        amountUSDC: 1000000, // 1 USDC
        currency: 'USDC',
      },
    },
    {
      name: 'GET /api/payouts/status',
      method: 'GET',
      endpoint: `/api/payouts/status?paymentId=${TEST_DATA.paymentId}`,
    },
    {
      name: 'POST /api/payouts/retry',
      method: 'POST',
      endpoint: '/api/payouts/retry',
      data: {
        paymentId: TEST_DATA.paymentId,
        reason: 'Network timeout',
      },
    },
  ],

  // 4. Payment Links
  paymentLinks: [
    {
      name: 'POST /api/payment-links/create',
      method: 'POST',
      endpoint: '/api/payment-links/create',
      data: {
        type: 'product',
        name: 'Test Product Link',
        description: 'A test product for testing',
        amount: 2500, // $25.00
        currency: 'usd',
      },
    },
    {
      name: 'GET /api/payment-links',
      method: 'GET',
      endpoint: `/api/payment-links?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'GET /api/payment-links/[slug]',
      method: 'GET',
      endpoint: '/api/payment-links/test_slug_123',
    },
    {
      name: 'PUT /api/payment-links/[slug]',
      method: 'PUT',
      endpoint: '/api/payment-links/test_slug_123',
      data: {
        name: 'Updated Product Link',
        description: 'Updated description',
      },
    },
    {
      name: 'DELETE /api/payment-links/[slug]',
      method: 'DELETE',
      endpoint: '/api/payment-links/test_slug_123',
    },
  ],

  // 5. Products
  products: [
    {
      name: 'GET /api/products',
      method: 'GET',
      endpoint: `/api/products?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'POST /api/products',
      method: 'POST',
      endpoint: '/api/products',
      data: {
        sellerId: TEST_DATA.sellerId,
        name: 'Test Product',
        description: 'A test product for testing',
        priceUSD: 50.00,
        category: 'test',
      },
    },
    {
      name: 'GET /api/products/[id]',
      method: 'GET',
      endpoint: `/api/products/${TEST_DATA.productId}`,
    },
    {
      name: 'PUT /api/products/[id]',
      method: 'PUT',
      endpoint: `/api/products/${TEST_DATA.productId}`,
      data: {
        name: 'Updated Product',
        description: 'Updated description',
        priceUSD: 75.00,
      },
    },
    {
      name: 'DELETE /api/products/[id]',
      method: 'DELETE',
      endpoint: `/api/products/${TEST_DATA.productId}`,
    },
  ],

  // 6. Analytics & Monitoring
  analytics: [
    {
      name: 'GET /api/analytics/payments',
      method: 'GET',
      endpoint: `/api/analytics?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'GET /api/analytics/reconciliation',
      method: 'GET',
      endpoint: `/api/analytics/reconciliation?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'GET /api/analytics/revenue',
      method: 'GET',
      endpoint: `/api/analytics/revenue?sellerId=${TEST_DATA.sellerId}`,
    },
    {
      name: 'GET /api/analytics/dashboard',
      method: 'GET',
      endpoint: `/api/analytics/dashboard?sellerId=${TEST_DATA.sellerId}`,
    },
  ],

  // 7. Webhooks & Events
  webhooks: [
    {
      name: 'POST /api/webhooks/clerk',
      method: 'POST',
      endpoint: '/api/webhooks/clerk',
      data: {
        type: 'user.created',
        data: {
          id: TEST_DATA.clerkId,
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
        },
      },
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test-signature',
      },
    },
    {
      name: 'POST /api/webhooks/stripe',
      method: 'POST',
      endpoint: '/api/webhooks/stripe',
      data: {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: TEST_DATA.stripePaymentIntentId,
            amount: 1000,
            currency: 'usd',
            status: 'succeeded',
          },
        },
      },
      headers: {
        'stripe-signature': 'test-signature',
      },
    },
    {
      name: 'POST /api/webhooks/blockradar',
      method: 'POST',
      endpoint: '/api/webhooks/blockradar',
      data: {
        type: 'transaction.confirmed',
        data: {
          transaction_id: TEST_DATA.transactionId,
          wallet_id: TEST_DATA.blockradarWalletId,
          amount: '1000000',
          currency: 'USDC',
          status: 'confirmed',
        },
      },
      headers: {
        'x-blockradar-signature': 'test-signature',
      },
    },
  ],

  // 8. Admin & System
  admin: [
    {
      name: 'GET /api/admin/users',
      method: 'GET',
      endpoint: '/api/admin/users',
    },
    {
      name: 'GET /api/admin/payments',
      method: 'GET',
      endpoint: '/api/admin/payments',
    },
    {
      name: 'GET /api/admin/analytics',
      method: 'GET',
      endpoint: '/api/admin/analytics',
    },
    {
      name: 'POST /api/admin/maintenance',
      method: 'POST',
      endpoint: '/api/admin/maintenance',
      data: {
        operation: 'cleanup_orphaned_data',
        options: {
          dryRun: true,
          batchSize: 10,
        },
      },
    },
  ],
};

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Endpoint Testing');
  console.log(`📍 Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log('=' * 50);

  const categories = Object.keys(tests);
  
  for (const category of categories) {
    console.log(`\n📂 Testing ${category.toUpperCase()} endpoints:`);
    console.log('-'.repeat(30));
    
    const categoryTests = tests[category];
    
    for (const test of categoryTests) {
      const result = await makeRequest(test.method, test.endpoint, test.data, test.headers);
      logTest(test.name, result);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n🎯 Testing completed!');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest, logTest };
