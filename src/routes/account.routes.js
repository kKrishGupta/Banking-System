const { Router } = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controller/accountController");

const accountRoutes = Router();

// POST /api/account
accountRoutes.post(
  "/",
  authMiddleware,
  accountController.createAccountController
);
// get /api/accounts/
// get all accounts of the logged-in
// protected routes

accountRoutes.get(
  "/",
  authMiddleware,
  accountController.getUserAccountController
);

// get /api/accounts/lookup/:accountNumber
accountRoutes.get(
  "/lookup/:accountNumber",
  authMiddleware,
  accountController.getAccountByNumberController
);

// get /api/accounts/balance: accountId

accountRoutes.get("/balance/:accountId",authMiddleware,accountController.getAccountBalanceController)
module.exports = accountRoutes;
