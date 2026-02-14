import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

function normalizeUser(rawUser, token) {
  if (!rawUser) {
    return null;
  }

  return {
    id: rawUser._id,
    name: rawUser.name,
    email: rawUser.email,
    isAdmin: !!rawUser.systemUser,
    token,
  };
}

function normalizeAccount(rawAccount, balance = 0) {
  return {
    id: rawAccount._id,
    userId: rawAccount.user,
    accountNumber: rawAccount.accountNumber || rawAccount._id,
    balance,
    createdAt: rawAccount.createdAt,
    status: rawAccount.status,
    currency: rawAccount.currency,
  };
}

function normalizeTransaction(rawTransaction, userAccountIds) {
  const fromAccountId = rawTransaction?.fromAccount?._id || rawTransaction?.fromAccount;
  const toAccountId = rawTransaction?.toAccount?._id || rawTransaction?.toAccount;
  const fromAccountNumber = rawTransaction?.fromAccount?.accountNumber || fromAccountId;
  const toAccountNumber = rawTransaction?.toAccount?.accountNumber || toAccountId;

  const isDebit = userAccountIds.has(String(fromAccountId));

  return {
    id: rawTransaction._id,
    fromAccountId,
    toAccountId,
    amount: rawTransaction.amount,
    type: isDebit ? "DEBIT" : "CREDIT",
    status: rawTransaction.status === "COMPLETED" ? "SUCCESS" : rawTransaction.status,
    idempotencyKey: rawTransaction.idempotencyKey,
    createdAt: rawTransaction.createdAt,
    fromAccountNumber,
    toAccountNumber,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [accounts, setAccounts] = useState(() => {
    const storedAccounts = localStorage.getItem("accounts");
    if (!storedAccounts) {
      return [];
    }

    try {
      return JSON.parse(storedAccounts);
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (!storedTransactions) {
      return [];
    }

    try {
      return JSON.parse(storedTransactions);
    } catch {
      return [];
    }
  });

  const token = user?.token || null;

  const refreshAccounts = useCallback(async (activeToken) => {
    if (!activeToken) {
      setAccounts([]);
      return [];
    }

    const accountResponse = await apiRequest("/accounts", {
      token: activeToken,
    }).catch((error) => {
      if (String(error?.message || "").includes("No accounts found")) {
        return { accounts: [] };
      }
      throw error;
    });

    const rawAccounts = accountResponse?.accounts || [];

    const accountWithBalances = await Promise.all(
      rawAccounts.map(async (account) => {
        const balanceResponse = await apiRequest(`/accounts/balance/${account._id}`, {
          token: activeToken,
        });

        return normalizeAccount(account, balanceResponse?.balance || 0);
      })
    );

    setAccounts(accountWithBalances);
    return accountWithBalances;
  }, []);

  const refreshTransactions = useCallback(async (activeToken, currentAccounts = []) => {
    if (!activeToken) {
      setTransactions([]);
      return [];
    }

    const transactionResponse = await apiRequest("/transaction?limit=200", {
      token: activeToken,
    });

    const userAccountIds = new Set(currentAccounts.map((acc) => String(acc.id)));
    const normalized = (transactionResponse?.transactions || []).map((txn) =>
      normalizeTransaction(txn, userAccountIds)
    );

    setTransactions(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (!token) {
      setAccounts([]);
      setTransactions([]);
      return;
    }

    (async () => {
      try {
        const freshAccounts = await refreshAccounts(token);
        await refreshTransactions(token, freshAccounts);
      } catch {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
      }
    })();
  }, [token, refreshAccounts, refreshTransactions]);

  const login = async (email, password) => {
    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const normalized = normalizeUser(response?.user, response?.token);
      if (!normalized) {
        return false;
      }

      setUser(normalized);
      const freshAccounts = await refreshAccounts(response?.token);
      await refreshTransactions(response?.token, freshAccounts);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      const normalized = normalizeUser(response?.user, response?.token);
      if (!normalized) {
        return false;
      }

      setUser(normalized);
      const freshAccounts = await refreshAccounts(response?.token);
      await refreshTransactions(response?.token, freshAccounts);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    const activeToken = user?.token;

    try {
      if (activeToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          token: activeToken,
        });
      }
    } catch {
      // Best effort logout
    }

    setUser(null);
    setAccounts([]);
    setTransactions([]);
    localStorage.removeItem("user");
    localStorage.removeItem("accounts");
    localStorage.removeItem("transactions");
  };

  const createAccount = async () => {
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await apiRequest("/accounts", {
      method: "POST",
      token,
    });

    const createdRawAccount = response?.account;
    if (!createdRawAccount?._id) {
      throw new Error("Unable to create account");
    }

    const balanceResponse = await apiRequest(`/accounts/balance/${createdRawAccount._id}`, {
      token,
    });

    const created = normalizeAccount(createdRawAccount, balanceResponse?.balance || 0);

    setAccounts((prev) => {
      const next = prev.filter((acc) => acc.id !== created.id);
      next.push(created);
      return next;
    });

    return created;
  };

  const transferMoney = async (fromAccountId, toAccountNumber, amount, idempotencyKey) => {
    if (!token) {
      return false;
    }

    try {
      const response = await apiRequest("/transaction", {
        method: "POST",
        token,
        body: {
          fromAccount: fromAccountId,
          toAccount: toAccountNumber,
          amount,
          idempotencyKey,
        },
      });

      if (String(response?.message || "").toLowerCase().includes("already processed")) {
        return false;
      }

      const freshAccounts = await refreshAccounts(token);
      await refreshTransactions(token, freshAccounts);
      return true;
    } catch {
      return false;
    }
  };

  const creditInitialFunds = async (accountId, amount, idempotencyKey) => {
    if (!token || !user?.isAdmin) {
      return false;
    }

    try {
      const response = await apiRequest("/transaction/system/initial-funds", {
        method: "POST",
        token,
        body: {
          toAccount: accountId,
          amount,
          idempotencyKey,
        },
      });

      if (String(response?.message || "").toLowerCase().includes("already processed")) {
        return false;
      }

      const freshAccounts = await refreshAccounts(token);
      await refreshTransactions(token, freshAccounts);
      return true;
    } catch {
      return false;
    }
  };

  const getAccountByNumber = (accountNumber) => {
    return accounts.find((acc) => acc.accountNumber === accountNumber || acc.id === accountNumber);
  };

  const value = {
    user,
    accounts,
    transactions,
    login,
    register,
    logout,
    createAccount,
    transferMoney,
    creditInitialFunds,
    getAccountByNumber,
    refreshAccounts: () => refreshAccounts(token),
    refreshTransactions: () => refreshTransactions(token, accounts),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
