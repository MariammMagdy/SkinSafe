const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const Verification = require("../models/codeModel");
const User = require("../models/userModel");
const { sanitizeUser } = require("../utils/sanitizeData");

// ============== SIGNUP ==============
exports.signup = asyncHandler(async (req, res, next) => {
  // Check if email already exists
  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    return next(new ApiError("Email already exists", 400));
  }

  // Check if userName already exists
  const existingUserName = await User.findOne({ userName: req.body.userName });
  if (existingUserName) {
    return next(new ApiError("Username already exists", 400));
  }

  // Clean up any previous verification
  const check = await Verification.findOne({ email: req.body.email });
  if (check) {
    await Verification.deleteOne({ _id: check._id });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  // Prepare FCM tokens
  const fcmTokens = req.body.fcmToken ? [req.body.fcmToken] : [];

  // Create the user
  const user = await User.create({
    name: req.body.name,
    userName: req.body.userName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    skinTone: req.body.skinTone,
    password: hashedPassword,
    fcmToken: fcmTokens,
  });

  // Generate token
  const token = createToken(user._id);

  return res.status(201).json({
    data: sanitizeUser(user),
    token,
    message: "success",
  });
});

// ============== LOGIN ==============
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (req.body.fcmToken) {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { fcmToken: req.body.fcmToken } }
    );
  }

  const token = createToken(user._id);
  const updatedUser = await User.findById(user._id);

  return res.status(200).json({
    data: sanitizeUser(updatedUser),
    token,
    message: "success",
  });
});

// ============== PROTECT ROUTE ==============
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not logged in! Please log in.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.userId).select("+role");
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists.", 401)
    );
  } // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    //1.convert date to timestamps
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// ============== ALLOWED TO (Role based access) ==============
exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  };
};

// ============== PROTECT FORGET PASSWORD FLOW ==============
exports.protectforget = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in, please login to access this route",
        401
      )
    );
  }

  try {
    const bytes = CryptoJS.AES.decrypt(token, process.env.ENCRYPTION_SECRET);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedToken) {
      return next(new ApiError("Invalid token", 401));
    }

    const decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError("The user belonging to this token does not exist", 401)
      );
    }

    if (!currentUser.active) {
      return next(new ApiError("The user is not active now", 401));
    }

    if (currentUser.passwordChangeAt) {
      const passChangedTimestamp = parseInt(
        currentUser.passwordChangeAt / 1000,
        10
      );
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError("Password changed recently, please login again", 401)
        );
      }
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error(error);
    return next(new ApiError("Invalid or expired token", 401));
  }
});

// ============== PROTECT CODE VERIFICATION ==============
exports.protectCode = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in, please login to access this route",
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentCode = await Verification.findById(decoded.userId);

  if (!currentCode) {
    return next(new ApiError("The verification code no longer exists", 401));
  }

  if (Date.now() > currentCode.expiresAt) {
    return next(new ApiError("Verification code expired", 400));
  }

  req.code = currentCode;
  next();
});

// ============== FORGOT PASSWORD ==============
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name},\n\nWe received a request to reset your Skin Safe Account password.\n\nYour reset code is: ${resetCode}\n\nThanks,\nSkin Safe Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();

    return next(new ApiError("There is an error in sending email", 500));
  }

  const token = createToken(user._id);
  const encryptedToken = CryptoJS.AES.encrypt(
    token,
    process.env.ENCRYPTION_SECRET
  ).toString();

  res.status(200).json({
    status: "success",
    message: "Reset code sent to your email",
    token: encryptedToken,
  });
});

// ============== VERIFY RESET CODE ==============
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  } // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset code verified",
  });
});

// ============== RESET PASSWORD ==============
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  const { newPassword } = req.body;
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

/*
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js"); // ✅ التصحيح هنا
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const Verification = require("../models/codeModel");
const User = require("../models/userModel");
const { sanitizeUser } = require("../utils/sanitizeData");

// @desc    Signup
// @route   GET /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const check = await Verification.findOne({ email: req.body.email });
  if (check) {
    await Verification.deleteOne({ _id: check._id });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const fcmTokens = req.body.fcmToken ? [req.body.fcmToken] : [];

  const user = await User.create({
    name: req.body.name,
    userName: req.body.userName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    skinTone: req.body.skinTone,
    password: hashedPassword,
    fcmToken: fcmTokens,
  });

  return res.status(201).json({
    data: sanitizeUser(user),
    message: "success",
  });
});

// @desc    Login
// @route   GET /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (req.body.fcmToken) {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { fcmToken: req.body.fcmToken } }
    );
  }

  const token = createToken(user._id);
  const updatedUser = await User.findById(user._id);

  return res.status(200).json({
    data: sanitizeUser(updatedUser),
    token,
    message: "success",
  });
});

// @desc    Protect Middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not logged in! Please log in.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.userId).select("+role");

  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists.", 401)
    );
  }

  req.user = currentUser;
  next();
});

// @desc    Allowed to
exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  };
};

// @desc    Protect Forget Password
exports.protectforget = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return next(new ApiError("You are not logged in! Please log in.", 401));
  }

  token = CryptoJS.AES.decrypt(token, process.env.HASH_PASS).toString(
    CryptoJS.enc.Utf8
  );

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists.", 401)
    );
  }

  if (!currentUser.active) {
    return next(
      new ApiError("The user belonging to this token is not active now.", 401)
    );
  }

  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "Your password has changed recently, please login again.",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc    Protect Code
exports.protectCode = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return next(new ApiError("You are not logged in! Please log in.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentCode = await Verification.findById(decoded.userId);

  if (!currentCode) {
    return next(new ApiError("Verification code does not exist.", 401));
  }

  if (Date.now() > currentCode.expiresAt) {
    return next(new ApiError("Verification code expired.", 400));
  }

  req.code = currentCode;
  next();
});

// @desc    Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name},\nWe received a request to reset your password.\n${resetCode}\nUse this code to reset your password.\nThanks,\nSkin Safe Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();

    return next(new ApiError("There is an error sending the email", 500));
  }

  const token = createToken(user._id);
  const encryptedToken = CryptoJS.AES.encrypt(
    token,
    process.env.ENCRYPTION_SECRET
  ).toString();

  res.status(200).json({
    status: "success",
    message: "Reset code sent to your email",
    token: encryptedToken,
  });
});

// @desc    Verify Password Reset Code
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findById(req.user._id);

  if (
    user.passwordResetCode !== hashedResetCode ||
    user.passwordResetExpires <= Date.now()
  ) {
    return next(new ApiError("Reset code invalid or expired", 401));
  }

  user.passwordResetVerified = true;
  await user.save();

  const token = req.headers.authorization;

  res.status(200).json({
    status: "success",
    message: "Reset code verified",
    token,
  });
});

// @desc    Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  const { newPassword } = req.body;

  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  const token = createToken(user._id);

  res.status(200).json({ token });
});
*/
