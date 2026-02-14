import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { History, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { formatUsdAsInr } from "../utils/currency";
function TransactionsPage() {
  const { user, accounts, transactions } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const userAccounts = accounts.filter((acc) => acc.userId === user?.id);
  const userAccountIds = userAccounts.map((acc) => acc.id);
  let filteredTransactions = transactions.filter(
    (txn) => userAccountIds.includes(txn.fromAccountId) || userAccountIds.includes(txn.toAccountId)
  );
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.type === filterType.toUpperCase()
    );
  }
  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.idempotencyKey.toLowerCase().includes(searchTerm.toLowerCase()) || txn.id.toLowerCase().includes(searchTerm.toLowerCase()) || txn.fromAccountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || txn.toAccountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  filteredTransactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return <DashboardLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">
            Complete ledger-based view of all your transactions
          </p>
        </div>

        {
    /* Filters */
  }
        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
    type="text"
    placeholder="Search by idempotency key, transaction ID, or account..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 bg-white"
  />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="credit">Credit Only</SelectItem>
                  <SelectItem value="debit">Debit Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {
    /* Transactions Table */
  }
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              All Transactions
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions found</p>
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From Account</TableHead>
                      <TableHead>To Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => <TableRow
    key={txn.id}
    className="cursor-pointer hover:bg-gray-50"
    onClick={() => setSelectedTransaction(txn)}
  >
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                          <div className="text-xs text-gray-500">
                            {format(new Date(txn.createdAt), "HH:mm:ss")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {txn.type === "CREDIT" ? <ArrowDownRight className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                            <Badge
    variant={txn.type === "CREDIT" ? "default" : "destructive"}
    className={txn.type === "CREDIT" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}
  >
                              {txn.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {txn.fromAccountNumber}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {txn.toAccountNumber}
                        </TableCell>
                        <TableCell>
                          <span
    className={`font-semibold ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
  >
                            {txn.type === "CREDIT" ? "+" : "-"}
                            {formatUsdAsInr(txn.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
    variant={txn.status === "SUCCESS" ? "default" : "secondary"}
    className={txn.status === "SUCCESS" ? "bg-blue-100 text-blue-700" : ""}
  >
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500">View Details</span>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
          </CardContent>
        </Card>
      </div>

      {
    /* Transaction Detail Modal */
  }
      <Dialog
    open={!!selectedTransaction}
    onOpenChange={() => setSelectedTransaction(null)}
  >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono break-all">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <Badge
    variant={selectedTransaction.type === "CREDIT" ? "default" : "destructive"}
    className={selectedTransaction.type === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
  >
                    {selectedTransaction.type}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Idempotency Key</p>
                <p className="text-sm font-mono break-all bg-gray-50 p-2 rounded">
                  {selectedTransaction.idempotencyKey}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">From Account</p>
                  <p className="text-sm font-mono">
                    {selectedTransaction.fromAccountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">To Account</p>
                  <p className="text-sm font-mono">
                    {selectedTransaction.toAccountNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Amount</p>
                  <p
    className={`text-2xl font-bold ${selectedTransaction.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
  >
                    {selectedTransaction.type === "CREDIT" ? "+" : "-"}
                    {formatUsdAsInr(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <Badge
    variant={selectedTransaction.status === "SUCCESS" ? "default" : "secondary"}
    className={selectedTransaction.status === "SUCCESS" ? "bg-blue-100 text-blue-700" : ""}
  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                <p className="text-sm">
                  {format(
    new Date(selectedTransaction.createdAt),
    "MMMM dd, yyyy - HH:mm:ss"
  )}
                </p>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </DashboardLayout>;
}
export {
  TransactionsPage as default
};
