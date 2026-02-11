const authMiddleware = require("../middleware/auth.middleware");
const { createAccountController } = require("../controller/accountController");

const express = require("express");
const router = express.Router();

router.post("/", authMiddleware, createAccountController);

module.exports = router;
