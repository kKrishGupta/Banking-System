const express = require('express');
const authController = require("../controller/authController");

const router = express.Router();
// *post/ api/auth/register
router.post("/register", authController.userRegisterController);

router.post("/login", authController.userLoginController)
 module.exports = router;