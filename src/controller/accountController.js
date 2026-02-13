const accountModel = require("../models/account.model");
const { getAccountBalanceController } = require("./transaction.controller");
async function createAccountController(req,res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const account = await accountModel.create({
    user: req.user._id,
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

module.exports = {
  createAccountController,
  getUserAccountController,
  getAccountBalanceController
};