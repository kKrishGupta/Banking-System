import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Coins, RefreshCw, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatUsdAsInr, getUsdToInrRate } from "../utils/currency";
function AdminPage() {
  const { user, accounts, creditInitialFunds } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isAccountNumberOrId = (value) => /^\d{10}$/.test(value) || /^[a-fA-F0-9]{24}$/.test(value);
  if (!user?.isAdmin) {
    return <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md shadow-sm border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-gray-900">Access Denied</h3>
              <p className="text-gray-600">
                You don't have permission to access the admin panel.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>;
  }
  const generateIdempotencyKey = () => {
    const key = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setIdempotencyKey(key);
    toast.success("Idempotency key generated");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !amount || !idempotencyKey) {
      toast.error("Please fill in all fields");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!isAccountNumberOrId(selectedAccountId)) {
      toast.error("Enter a valid 10-digit account number or 24-character account ID");
      return;
    }
    setLoading(true);
    try {
      const success = await creditInitialFunds(
        selectedAccountId,
        amountNum,
        idempotencyKey
      );
      if (success) {
        setShowSuccessModal(true);
        setSelectedAccountId("");
        setAmount("");
        setIdempotencyKey("");
        toast.success("Funds credited successfully!");
      } else {
        toast.error("Failed to credit funds. Check the idempotency key.");
      }
    } catch (error) {
      toast.error("An error occurred while crediting funds");
    } finally {
      setLoading(false);
    }
  };
  return <DashboardLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">
              System administration and fund management
            </p>
          </div>
        </div>

        {
    /* Credit Funds Form */
  }
        <div className="max-w-2xl">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Credit Initial Funds
              </CardTitle>
              <CardDescription>
                Add funds to user accounts (System Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="account">Destination Account Number / ID</Label>
                  <Input
    id="account"
    type="text"
    placeholder="Enter 10-digit account number or 24-char account ID"
    value={selectedAccountId}
    onChange={(e) => setSelectedAccountId(e.target.value)}
    required
    className="bg-white"
  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
    id="amount"
    type="number"
    placeholder="0.00"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    required
    step="0.01"
    min="0.01"
    className="bg-white"
  />
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && <p className="text-xs text-gray-600">
                      Approx in INR: {formatUsdAsInr(parseFloat(amount))} (Rate: {getUsdToInrRate()})
                    </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idempotencyKey">Idempotency Key</Label>
                  <div className="flex gap-2">
                    <Input
    id="idempotencyKey"
    type="text"
    placeholder="Generate or enter idempotency key"
    value={idempotencyKey}
    onChange={(e) => setIdempotencyKey(e.target.value)}
    required
    className="bg-white flex-1"
  />
                    <Button
    type="button"
    variant="outline"
    onClick={generateIdempotencyKey}
    className="gap-2"
  >
                      <RefreshCw className="w-4 h-4" />
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Ensures this credit operation is processed only once
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : "Credit Funds"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {
    /* Admin Info */
  }
        <div className="max-w-2xl">
          <Card className="bg-purple-50 border-purple-100">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-purple-900">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5" />
                <p>
                  Credit initial funds to any account in the system
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5" />
                <p>
                  All operations are tracked with idempotency keys for audit purposes
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5" />
                <p>
                  Transactions are recorded as CREDIT from SYSTEM account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {
    /* System Statistics */
  }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Accounts</p>
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total System Balance</p>
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatUsdAsInr(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Admin Status</p>
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Active</p>
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
            <DialogTitle className="text-center">Funds Credited!</DialogTitle>
            <DialogDescription className="text-center">
              The funds have been successfully credited to the account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
              <p className="text-sm font-mono break-all">{idempotencyKey}</p>
            </div>
            <div className="text-center text-sm text-gray-600">
              This transaction has been recorded in the ledger.
            </div>
          </div>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>;
}
export {
  AdminPage as default
};
