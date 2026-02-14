const transactionModel = require("../models/transcation");
const ledgerModel = require("../models/ledger");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");


// =======================================================
// NORMAL USER TRANSACTION
// =======================================================
async function createTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1️⃣ Validation
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "fromAccount, toAccount, amount and idempotencyKey are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // 2️⃣ Fetch accounts
    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount",
      });
    }

    if (String(fromUserAccount.user) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only transfer from your own account",
      });
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both accounts must be ACTIVE",
      });
    }

    // 3️⃣ Prevent duplicate transaction
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }

    // 4️⃣ Balance check
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}`,
      });
    }

    // 5️⃣ Start DB transaction
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      }],
      { session }
    );

    // 6️⃣ Debit sender
    await ledgerModel.create([{
      account: fromAccount,
      amount,
      transaction: transaction._id,
      type: "DEBIT",
    }], { session });

    // 7️⃣ Credit receiver
    await ledgerModel.create([{
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "CREDIT",
    }], { session });

    // 8️⃣ Complete transaction
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 9️⃣ Send email (outside DB transaction)
    await emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount
    );

    return res.status(201).json({
      message: "Transaction completed successfully",
      transactionId: transaction._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction Error:", error);

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
}


// =======================================================
// SYSTEM INITIAL FUNDS
// =======================================================
async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // 🔐 Ensure system user
    if (!req.user.systemUser) {
      return res.status(403).json({
        message: "Only system user can perform this action",
      });
    }

    // Prevent duplicate
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }

    const toUserAccount = mongoose.Types.ObjectId.isValid(toAccount)
      ? await accountModel.findById(toAccount)
      : await accountModel.findOne({ accountNumber: toAccount });

    if (!toUserAccount) {
      return res.status(400).json({
        message: "Invalid toAccount",
      });
    }

    const systemAccount = await accountModel.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    if (!systemAccount) {
      return res.status(400).json({
        message: "System user account not found",
      });
    }

    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [{
        fromAccount: systemAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING",
      }],
      { session }
    );

    await ledgerModel.create([{
      account: systemAccount._id,
      amount,
      transaction: transaction._id,
      type: "DEBIT",
    }], { session });

    await ledgerModel.create([{
      account: toUserAccount._id,
      amount,
      transaction: transaction._id,
      type: "CREDIT",
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Initial funds credited successfully",
      transactionId: transaction._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("System Transaction Error:", error);

    return res.status(500).json({
      message: "Initial funds transaction failed",
      error: error.message,
    });
  }
}


// =======================================================
// GET BALANCE
// =======================================================
async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }

  const balance = await account.getBalance();

  return res.status(200).json({
    accountId: account._id,
    balance,
  });
}

// =======================================================
// GET USER TRANSACTIONS
// =======================================================
async function getUserTransactions(req, res) {
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);

  const userAccounts = await accountModel.find({ user: req.user._id }).select("_id");
  const accountIds = userAccounts.map((account) => account._id);

  if (accountIds.length === 0) {
    return res.status(200).json({ transactions: [] });
  }

  const transactions = await transactionModel
    .find({
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("fromAccount", "_id accountNumber")
    .populate("toAccount", "_id accountNumber");

  return res.status(200).json({
    transactions,
  });
}


module.exports = {
  createTransaction,
  createInitialFundsTransaction,
  getAccountBalanceController,
  getUserTransactions,
};
