'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletData {
  id: string;
  address: string;
  balance: string;
  currency: string;
  created_at: string;
}

interface TransactionData {
  id: string;
  from_address: string;
  to_address: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  created_at: string;
}

export function WalletDashboard({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // For now, using mock data
      const mockWallet: WalletData = {
        id: 'wallet_123',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        balance: '1000.50',
        currency: 'USDC',
        created_at: new Date().toISOString(),
      };

      const mockTransactions: TransactionData[] = [
        {
          id: 'tx_123',
          from_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          to_address: '0x8ba1f109551bD432803012645Hac136c',
          amount: '100.00',
          currency: 'USDC',
          status: 'confirmed',
          hash: '0x1234567890abcdef...',
          created_at: new Date().toISOString(),
        },
      ];

      setWallet(mockWallet);
      setTransactions(mockTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      const response = await fetch('/api/wallets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currency: 'USDC',
          label: `Wallet for user ${userId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create wallet');
      }

      const { wallet } = await response.json();
      setWallet(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Overview</CardTitle>
          <CardDescription>Your crypto wallet information</CardDescription>
        </CardHeader>
        <CardContent>
          {wallet ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Balance</span>
                <span className="text-2xl font-bold">
                  {wallet.balance} {wallet.currency}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Address</span>
                <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all">
                  {wallet.address}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-500">No wallet found</p>
              <Button onClick={createWallet}>Create Wallet</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent crypto transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {tx.amount} {tx.currency}
                      </span>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      To: {tx.to_address.slice(0, 8)}...{tx.to_address.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  {tx.hash && (
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
