const transactionModel = require("../models/transcation");
const ledgerModel = require("../models/ledger");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");


// ===============================================
// NORMAL USER TRANSACTION
// ===============================================
async function createTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "fromAccount, toAccount, amount and idempotencyKey are required",
      });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount",
      });
    }

    // Prevent duplicate transactions
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });
    if (existingTransaction) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both accounts must be ACTIVE",
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}`,
      });
    }

    // 🔥 Start DB transaction
    session.startTransaction();

    // Create transaction
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

    // Debit
    await ledgerModel.create([{
      account: fromAccount,
      amount,
      transaction: transaction._id,
      type: "DEBIT",
    }], { session });

    // Credit
    await ledgerModel.create([{
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "CREDIT",
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

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



// ===============================================
// SYSTEM INITIAL FUNDS
// ===============================================
async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    // 🔐 Ensure only system user can call
    if (!req.user.systemUser) {
      return res.status(403).json({
        message: "Only system user can perform this action",
      });
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey });
    if (existingTransaction) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }

    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
      return res.status(400).json({
        message: "Invalid toAccount",
      });
    }

    // Find system account
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
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      }],
      { session }
    );

    // Debit system
    await ledgerModel.create([{
      account: systemAccount._id,
      amount,
      transaction: transaction._id,
      type: "DEBIT",
    }], { session });

    // Credit user
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



// ===============================================
// GET ACCOUNT BALANCE
// ===============================================
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


module.exports = {
  createTransaction,
  createInitialFundsTransaction,
  getAccountBalanceController,
};
