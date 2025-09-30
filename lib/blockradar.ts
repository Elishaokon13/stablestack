import axios, { AxiosInstance } from 'axios';

// Blockradar API client
const blockradarClient: AxiosInstance = axios.create({
  baseURL: process.env.BLOCKRADAR_API_URL || 'https://api.blockradar.co',
  headers: {
    'Authorization': `Bearer ${process.env.BLOCKRADAR_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Types for Blockradar API responses
export interface BlockradarWallet {
  id: string;
  address: string;
  balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BlockradarTransaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletRequest {
  currency: string;
  label?: string;
}

export interface CreateTransactionRequest {
  from_wallet_id: string;
  to_address: string;
  amount: string;
  currency: string;
  memo?: string;
}

// Wallet operations
export async function createWallet(currency: string = 'USDC', label?: string) {
  try {
    const response = await blockradarClient.post('/wallets', {
      currency,
      label,
    });

    return {
      success: true,
      wallet: response.data as BlockradarWallet,
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getWallet(walletId: string) {
  try {
    const response = await blockradarClient.get(`/wallets/${walletId}`);
    return {
      success: true,
      wallet: response.data as BlockradarWallet,
    };
  } catch (error) {
    console.error('Error getting wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getWalletBalance(walletId: string) {
  try {
    const response = await blockradarClient.get(`/wallets/${walletId}/balance`);
    return {
      success: true,
      balance: response.data,
    };
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listWallets() {
  try {
    const response = await blockradarClient.get('/wallets');
    return {
      success: true,
      wallets: response.data as BlockradarWallet[],
    };
  } catch (error) {
    console.error('Error listing wallets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Transaction operations
export async function createTransaction(
  fromWalletId: string,
  toAddress: string,
  amount: string,
  currency: string = 'USDC',
  memo?: string
) {
  try {
    const response = await blockradarClient.post('/transactions', {
      from_wallet_id: fromWalletId,
      to_address: toAddress,
      amount,
      currency,
      memo,
    });

    return {
      success: true,
      transaction: response.data as BlockradarTransaction,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getTransaction(transactionId: string) {
  try {
    const response = await blockradarClient.get(`/transactions/${transactionId}`);
    return {
      success: true,
      transaction: response.data as BlockradarTransaction,
    };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listTransactions(walletId?: string, limit: number = 50) {
  try {
    const params = new URLSearchParams();
    if (walletId) params.append('wallet_id', walletId);
    params.append('limit', limit.toString());

    const response = await blockradarClient.get(`/transactions?${params.toString()}`);
    return {
      success: true,
      transactions: response.data as BlockradarTransaction[],
    };
  } catch (error) {
    console.error('Error listing transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Address operations
export async function generateAddress(walletId: string, label?: string) {
  try {
    const response = await blockradarClient.post(`/wallets/${walletId}/addresses`, {
      label,
    });

    return {
      success: true,
      address: response.data,
    };
  } catch (error) {
    console.error('Error generating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listAddresses(walletId: string) {
  try {
    const response = await blockradarClient.get(`/wallets/${walletId}/addresses`);
    return {
      success: true,
      addresses: response.data,
    };
  } catch (error) {
    console.error('Error listing addresses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Webhook operations
export async function createWebhook(url: string, events: string[]) {
  try {
    const response = await blockradarClient.post('/webhooks', {
      url,
      events,
    });

    return {
      success: true,
      webhook: response.data,
    };
  } catch (error) {
    console.error('Error creating webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Utility functions
export function formatAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(decimals);
}

export function parseAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(num * Math.pow(10, decimals)).toString();
}

// Error handling
export function handleBlockradarError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Unknown Blockradar error';
}
