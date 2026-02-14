export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  idempotencyKey: string;
  createdAt: Date;
  fromAccountNumber?: string;
  toAccountNumber?: string;
}
