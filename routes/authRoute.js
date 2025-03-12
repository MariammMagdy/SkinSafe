const express = require("express");
const {
  signup,
  verifyEmailUser,
  login,
  protectforget,
  protectCode,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authServices");

//validator function
const {
  signupValidator,
  loginValidator,
  resetValidator,
} = require("../utils/validator/authValidator");

const router = express.Router();

//user endpoints

router.post("/signup", signupValidator, signup);
router.post("/verify-email", protectCode, verifyEmailUser);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", protectforget, verifyPassResetCode);
router.post("/resetPassword", protectforget, resetValidator, resetPassword);

module.exports = router;
