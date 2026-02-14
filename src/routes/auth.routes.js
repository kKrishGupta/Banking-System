const express = require('express');
const authController = require("../controller/authController");

const router = express.Router();

// *post/ api/auth/register
router.post("/register", authController.userRegisterController);


// post /api/auth/login
router.post("/login", authController.userLoginController);

router.post("/logout",authController.userlogoutController);
 module.exports = router;