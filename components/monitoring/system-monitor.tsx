'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemStatus {
  stripe: {
    status: 'healthy' | 'degraded' | 'down';
    last_check: string;
    response_time: number;
    error_rate: number;
  };
  blockradar: {
    status: 'healthy' | 'degraded' | 'down';
    last_check: string;
    response_time: number;
    error_rate: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    last_check: string;
    response_time: number;
    connections: number;
  };
  webhooks: {
    stripe_webhooks: number;
    blockradar_webhooks: number;
    failed_webhooks: number;
    last_webhook: string;
  };
}

interface AlertData {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceMetrics {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  total_payouts: number;
  successful_payouts: number;
  failed_payouts: number;
  average_payment_time: number;
  average_payout_time: number;
  uptime_percentage: number;
}

export function SystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadSystemData();
    // Refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load system status
      const statusResponse = await fetch('/api/monitoring/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData);
      }

      // Load alerts
      const alertsResponse = await fetch('/api/monitoring/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }

      // Load performance metrics
      const metricsResponse = await fetch('/api/monitoring/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load system data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'down':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'down':
        return '❌';
      default:
        return '❓';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const formatTime = (ms: number) => {
    return `${ms}ms`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">
            {lastUpdated?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>💳</span>
                <span>Stripe API</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getStatusIcon(systemStatus.stripe.status)}</span>
                  <Badge className={getStatusColor(systemStatus.stripe.status)}>
                    {systemStatus.stripe.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Response: {formatTime(systemStatus.stripe.response_time)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Error Rate: {systemStatus.stripe.error_rate.toFixed(2)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>₿</span>
                <span>Blockradar API</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getStatusIcon(systemStatus.blockradar.status)}</span>
                  <Badge className={getStatusColor(systemStatus.blockradar.status)}>
                    {systemStatus.blockradar.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Response: {formatTime(systemStatus.blockradar.response_time)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Error Rate: {systemStatus.blockradar.error_rate.toFixed(2)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>🗄️</span>
                <span>Database</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getStatusIcon(systemStatus.database.status)}</span>
                  <Badge className={getStatusColor(systemStatus.database.status)}>
                    {systemStatus.database.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Response: {formatTime(systemStatus.database.response_time)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Connections: {systemStatus.database.connections}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Monitoring */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Payments</span>
                      <span className="text-sm font-bold">{metrics.total_payments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-bold">
                        {((metrics.successful_payments / metrics.total_payments) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.successful_payments / metrics.total_payments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payout Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Payouts</span>
                      <span className="text-sm font-bold">{metrics.total_payouts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-bold">
                        {((metrics.successful_payouts / metrics.total_payouts) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.successful_payouts / metrics.total_payouts) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Payment Time</span>
                      <span className="text-sm font-bold">{formatTime(metrics.average_payment_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Payout Time</span>
                      <span className="text-sm font-bold">{formatTime(metrics.average_payout_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-bold">{formatUptime(metrics.uptime_percentage)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="secondary">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No alerts at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                System performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Response Times</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Stripe API</span>
                        <span>{systemStatus?.stripe.response_time}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Blockradar API</span>
                        <span>{systemStatus?.blockradar.response_time}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Database</span>
                        <span>{systemStatus?.database.response_time}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Error Rates</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Stripe API</span>
                        <span>{systemStatus?.stripe.error_rate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Blockradar API</span>
                        <span>{systemStatus?.blockradar.error_rate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Status</CardTitle>
              <CardDescription>
                Webhook delivery and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus?.webhooks && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {systemStatus.webhooks.stripe_webhooks}
                      </div>
                      <p className="text-sm text-muted-foreground">Stripe Webhooks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStatus.webhooks.blockradar_webhooks}
                      </div>
                      <p className="text-sm text-muted-foreground">Blockradar Webhooks</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Failed Webhooks</span>
                      <span className="text-sm font-bold text-red-600">
                        {systemStatus.webhooks.failed_webhooks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Webhook</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(systemStatus.webhooks.last_webhook).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}







