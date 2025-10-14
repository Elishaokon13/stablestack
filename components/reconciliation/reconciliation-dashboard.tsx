'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReconciliationData {
  fiat_inflows: {
    total_amount: number;
    total_count: number;
    successful_payments: number;
    failed_payments: number;
    currency: string;
  };
  crypto_outflows: {
    total_amount: number;
    total_count: number;
    successful_payouts: number;
    failed_payouts: number;
    currency: string;
  };
  reconciliation_status: {
    balanced: boolean;
    discrepancy_amount: number;
    discrepancy_percentage: number;
  };
  recent_transactions: Array<{
    id: string;
    type: 'fiat_in' | 'crypto_out';
    amount: number;
    currency: string;
    status: 'success' | 'pending' | 'failed';
    timestamp: string;
    hash?: string;
  }>;
}

export function ReconciliationDashboard() {
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadReconciliationData();
    // Refresh every 30 seconds
    const interval = setInterval(loadReconciliationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadReconciliationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/reconciliation/status');
      if (!response.ok) {
        throw new Error('Failed to load reconciliation data');
      }

      const reconciliationData = await response.json();
      setData(reconciliationData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
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

  if (!data) {
    return (
      <Alert>
        <AlertDescription>No reconciliation data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reconciliation Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor fiat inflows vs crypto outflows
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">
            {lastUpdated?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fiat Inflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(data.fiat_inflows.total_amount, data.fiat_inflows.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.fiat_inflows.total_count} transactions
            </p>
            <div className="flex space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {data.fiat_inflows.successful_payments} successful
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.fiat_inflows.failed_payments} failed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crypto Outflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(data.crypto_outflows.total_amount, data.crypto_outflows.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.crypto_outflows.total_count} transactions
            </p>
            <div className="flex space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {data.crypto_outflows.successful_payouts} successful
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.crypto_outflows.failed_payouts} failed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reconciliation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {data.reconciliation_status.balanced ? '✅' : '⚠️'}
              </span>
              <div>
                <div className="text-lg font-bold">
                  {data.reconciliation_status.balanced ? 'Balanced' : 'Discrepancy'}
                </div>
                {!data.reconciliation_status.balanced && (
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(data.reconciliation_status.discrepancy_amount, 'USD')} 
                    ({formatPercentage(data.reconciliation_status.discrepancy_percentage)})
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest fiat payments and crypto payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.type === 'fiat_in' ? '💳 Fiat Payment' : '₿ Crypto Payout'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {transaction.hash && (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Success Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Fiat Payments</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(
                        (data.fiat_inflows.successful_payments / data.fiat_inflows.total_count) * 100
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(data.fiat_inflows.successful_payments / data.fiat_inflows.total_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Crypto Payouts</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(
                        (data.crypto_outflows.successful_payouts / data.crypto_outflows.total_count) * 100
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(data.crypto_outflows.successful_payouts / data.crypto_outflows.total_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatAmount(data.fiat_inflows.total_amount, data.fiat_inflows.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Fiat Volume</p>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatAmount(data.crypto_outflows.total_amount, data.crypto_outflows.currency)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Crypto Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Export reconciliation data for compliance and auditing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <span>📊</span>
                  <span>Daily Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <span>📈</span>
                  <span>Monthly Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <span>🔍</span>
                  <span>Audit Trail</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <span>📋</span>
                  <span>Compliance Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}






