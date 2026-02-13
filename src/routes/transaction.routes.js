const{Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const trasactionController = require("../controller/transaction.controller");

const transactionRoutes = Router();

transactionRoutes.post("/",authMiddleware.authMiddleware, trasactionController.createTransaction);

module.exports = transactionRoutes;