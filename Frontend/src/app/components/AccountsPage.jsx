import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { CreditCard, Plus, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatUsdAsInr } from "../utils/currency";
function AccountsPage() {
  const { user, accounts, createAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newAccount, setNewAccount] = useState(null);
  const userAccounts = accounts.filter((acc) => acc.userId === user?.id);
  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const account = await createAccount();
      setNewAccount(account);
      setShowSuccessModal(true);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  return <DashboardLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
            <p className="text-gray-600 mt-1">
              Manage all your bank accounts in one place
            </p>
          </div>
          <Button onClick={handleCreateAccount} disabled={loading} className="gap-2">
            <Plus className="w-4 h-4" />
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </div>

        {
    /* Accounts Grid */
  }
        {userAccounts.length === 0 ? <Card className="shadow-sm border-gray-200">
            <CardContent className="py-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2 text-gray-900">No accounts yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first bank account to get started
              </p>
              <Button onClick={handleCreateAccount} disabled={loading} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Account
              </Button>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAccounts.map((account, index) => <Card
    key={account.id}
    className="shadow-sm border-gray-200 hover:shadow-md transition-shadow"
  >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardDescription className="mb-1">
                        Account #{index + 1}
                      </CardDescription>
                      <CardTitle className="font-mono text-lg">
                        {account.accountNumber}
                      </CardTitle>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatUsdAsInr(account.balance)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900">
                        {format(new Date(account.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {
    /* Account Information */
  }
        <Card className="shadow-sm border-gray-200 bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <p>
                Each account has a unique 10-digit account number used for transfers
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <p>
                All accounts start with a zero balance and can be funded through transfers
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <p>
                You can create multiple accounts to organize your finances
              </p>
            </div>
          </CardContent>
        </Card>

        {
    /* Stats */
  }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Accounts</p>
              <p className="text-3xl font-bold text-gray-900">
                {userAccounts.length}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatUsdAsInr(userAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Average Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatUsdAsInr(userAccounts.length > 0 ? Math.round(
    userAccounts.reduce((sum, acc) => sum + acc.balance, 0) / userAccounts.length
  ) : 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {
    /* Success Modal */
  }
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-center">Account Created!</DialogTitle>
            <DialogDescription className="text-center">
              Your new bank account has been created successfully.
            </DialogDescription>
          </DialogHeader>
          {newAccount && <div className="space-y-3 py-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-2">Account Number</p>
                <p className="text-2xl font-bold font-mono">
                  {newAccount.accountNumber}
                </p>
              </div>
              <div className="text-center text-sm text-gray-600">
                Use this account number to receive transfers from other accounts.
              </div>
            </div>}
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>;
}
export {
  AccountsPage as default
};
