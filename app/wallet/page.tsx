import DashboardPageLayout from "@/components/dashboard/layout";
import WalletStatus from "@/components/wallet/wallet-status";
import WalletConnect from "@/components/wallet/wallet-connect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, DollarSign, TrendingUp } from "lucide-react";

export default function WalletPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Wallet Dashboard",
        description: "Manage your Web3 wallet and payments",
        icon: Wallet,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Wallet Status Card */}
        <WalletStatus />
        
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Connect Wallet</h4>
              <p className="text-xs text-muted-foreground">
                Connect your Web3 wallet to start receiving USDC payments
              </p>
              <WalletConnect className="w-full" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Payment Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Ready to receive payments
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 USDC</div>
            <p className="text-xs text-muted-foreground">
              In your connected wallet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total payments received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start selling products to see your transaction history here
            </p>
            <Badge variant="outline">
              Connect wallet to get started
            </Badge>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
