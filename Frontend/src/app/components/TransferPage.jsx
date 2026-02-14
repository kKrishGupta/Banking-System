import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ArrowRightLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatUsdAsInr, getUsdToInrRate } from "../utils/currency";
function TransferPage() {
  const { user, accounts, transferMoney } = useAuth();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState("");
  const isAccountNumberOrId = (value) => /^\d{10}$/.test(value) || /^[a-fA-F0-9]{24}$/.test(value);
  const userAccounts = accounts.filter((acc) => acc.userId === user?.id);
  const generateIdempotencyKey = () => {
    const key = `idp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setIdempotencyKey(key);
    toast.success("Idempotency key generated");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountNumber || !amount || !idempotencyKey) {
      toast.error("Please fill in all fields");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!isAccountNumberOrId(toAccountNumber)) {
      toast.error("Enter a valid 10-digit account number or 24-character account ID");
      return;
    }
    const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
    if (!fromAccount) {
      toast.error("Invalid source account");
      return;
    }
    if (fromAccount.accountNumber === toAccountNumber) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    if (fromAccount.balance < amountNum) {
      toast.error("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const success = await transferMoney(
        fromAccountId,
        toAccountNumber,
        amountNum,
        idempotencyKey
      );
      if (success) {
        setLastTransactionId(idempotencyKey);
        setShowSuccessModal(true);
        setToAccountNumber("");
        setAmount("");
        setIdempotencyKey("");
        toast.success("Transfer completed successfully!");
      } else {
        toast.error("Transfer failed. Please check the destination account number and try again.");
      }
    } catch (error) {
      toast.error("An error occurred during the transfer");
    } finally {
      setLoading(false);
    }
  };
  return <DashboardLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Money</h1>
          <p className="text-gray-600 mt-1">
            Send money securely between accounts
          </p>
        </div>

        {
    /* Transfer Form */
  }
        <div className="max-w-2xl">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                New Transfer
              </CardTitle>
              <CardDescription>
                Fill in the details to transfer money
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAccounts.length === 0 ? <div className="text-center py-8">
                  <p className="text-gray-600">
                    You don't have any accounts to transfer from
                  </p>
                </div> : <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount">From Account</Label>
                    <Select
    value={fromAccountId}
    onValueChange={setFromAccountId}
  >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAccounts.map((account) => <SelectItem key={account.id} value={account.id}>
                            {account.accountNumber} - {formatUsdAsInr(account.balance)}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toAccount">To Account Number / ID</Label>
                    <Input
    id="toAccount"
    type="text"
    placeholder="Enter 10-digit account number or 24-char account ID"
    value={toAccountNumber}
    onChange={(e) => setToAccountNumber(e.target.value)}
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
                      This key ensures the transaction is processed only once
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
    type="submit"
    className="w-full"
    disabled={loading}
  >
                      {loading ? "Processing..." : "Transfer Money"}
                    </Button>
                  </div>
                </form>}
            </CardContent>
          </Card>
        </div>

        {
    /* Info Cards */
  }
        <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-900 mb-2">Instant Transfer</h4>
              <p className="text-sm text-blue-700">
                All transfers are processed instantly with real-time balance updates.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-100">
            <CardContent className="pt-6">
              <h4 className="font-medium text-green-900 mb-2">Secure & Safe</h4>
              <p className="text-sm text-green-700">
                Idempotency keys prevent duplicate transactions and ensure data integrity.
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
            <DialogTitle className="text-center">Transfer Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your money has been transferred successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
              <p className="text-sm font-mono break-all">{lastTransactionId}</p>
            </div>
            <div className="text-center text-sm text-gray-600">
              You can view this transaction in your transaction history.
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
  TransferPage as default
};
