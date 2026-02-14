const accountModel = require("../models/account.model");
const { getAccountBalanceController } = require("./transaction.controller");

async function generateUniqueAccountNumber() {
  while (true) {
    const accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
    const exists = await accountModel.exists({ accountNumber });
    if (!exists) {
      return accountNumber;
    }
  }
}

async function createAccountController(req,res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const accountNumber = await generateUniqueAccountNumber();

  const account = await accountModel.create({
    user: req.user._id,
    accountNumber,
  });
  res.status(201).json({
    account,
  });
}

async function getUserAccountController(req, res) {
  const accounts = await accountModel.find({
    user: req.user._id
  });
  if (!accounts || accounts.length === 0) {
    return res.status(404).json({
      message: "No accounts found"
    });
  }
  return res.status(200).json({
    accounts
  });
}

async function getAccountByNumberController(req, res) {
  const { accountNumber } = req.params;

  if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
    return res.status(400).json({
      message: "Valid 10-digit account number is required",
    });
  }

  const account = await accountModel.findOne({
    accountNumber,
    status: "ACTIVE",
  }).select("_id accountNumber status currency user");

  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }

  return res.status(200).json({
    account,
  });
}

module.exports = {
  createAccountController,
  getUserAccountController,
  getAccountBalanceController,
  getAccountByNumberController,
};
