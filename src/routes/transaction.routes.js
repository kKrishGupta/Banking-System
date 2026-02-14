const { Router } = require("express");
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");
const transactionController = require("../controller/transaction.controller");

const transactionRoutes = Router();

// get /api/transaction
transactionRoutes.get(
  "/",
  authMiddleware,
  transactionController.getUserTransactions
);

// Normal user transaction
// _post /api/transactions/
// create new transaction 

transactionRoutes.post(
  "/",
  authMiddleware,
  transactionController.createTransaction
);

// System-only transaction
transactionRoutes.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction
);

module.exports = transactionRoutes;
