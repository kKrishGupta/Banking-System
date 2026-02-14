import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRightLeft, Eye, TrendingUp, Wallet } from "lucide-react";
import { formatUsdAsInr } from "../utils/currency";
function DashboardPage() {
  const { user, accounts, transactions } = useAuth();
  const userAccounts = accounts.filter((acc) => acc.userId === user?.id);
  const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const userAccountIds = userAccounts.map((acc) => acc.id);
  const recentTransactions = transactions.filter(
    (txn) => userAccountIds.includes(txn.fromAccountId) || userAccountIds.includes(txn.toAccountId)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  return <DashboardLayout>
      <div className="space-y-8">
        {
    /* Welcome Header */
  }
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your banking activity
          </p>
        </div>

        {
    /* Stats Cards */
  }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Balance</CardDescription>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatUsdAsInr(totalBalance)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Across {userAccounts.length} account{userAccounts.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Accounts</CardDescription>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {userAccounts.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Bank accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Transactions</CardDescription>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {recentTransactions.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Recent activity</p>
            </CardContent>
          </Card>
        </div>

        {
    /* Account Summary */
  }
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>
              All your bank accounts in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAccounts.length === 0 ? <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any accounts yet</p>
                <Link to="/accounts">
                  <Button>Create Account</Button>
                </Link>
              </div> : <div className="space-y-3">
                {userAccounts.map((account) => <div
    key={account.id}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Account {account.accountNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Created {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatUsdAsInr(account.balance)}
                      </p>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {
    /* Quick Actions */
  }
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/transfer">
                <Button className="w-full gap-2 h-auto py-4" variant="outline">
                  <ArrowRightLeft className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Transfer Money</div>
                    <div className="text-xs text-gray-600">
                      Send money between accounts
                    </div>
                  </div>
                </Button>
              </Link>

              <Link to="/transactions">
                <Button className="w-full gap-2 h-auto py-4" variant="outline">
                  <TrendingUp className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">View Transactions</div>
                    <div className="text-xs text-gray-600">
                      See all your activity
                    </div>
                  </div>
                </Button>
              </Link>

              <Link to="/accounts">
                <Button className="w-full gap-2 h-auto py-4" variant="outline">
                  <Eye className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Manage Accounts</div>
                    <div className="text-xs text-gray-600">
                      View and create accounts
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {
    /* Recent Transactions */
  }
        {recentTransactions.length > 0 && <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest banking activity</CardDescription>
                </div>
                <Link to="/transactions">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((txn) => <div
    key={txn.id}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
  >
                    <div className="flex items-center gap-3">
                      <div
    className={`w-10 h-10 rounded-lg flex items-center justify-center ${txn.type === "CREDIT" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
  >
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {txn.type === "CREDIT" ? "Received" : "Sent"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
    className={`text-lg font-bold ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
  >
                        {txn.type === "CREDIT" ? "+" : "-"}
                        {formatUsdAsInr(txn.amount)}
                      </p>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>}
      </div>
    </DashboardLayout>;
}
export {
  DashboardPage as default
};
