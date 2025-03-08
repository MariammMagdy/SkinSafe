const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const createToken = require("../utils/createToken");

const User = require("../models/userModel");

// @desc    Signup
// @route   GET /api/auth/signup
// @access  Public

exports.signup = asyncHandler(async (req, res, next) => {
  //1) Create user
  const user = await User.create({
    name: req.body.name,
    phone: req.body.phone,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    skinTone: req.body.skinTone,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  //2) Generate and send token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   GET /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // 1) check if password and email in the body (validation)
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 2) Generate and send token
  const token = createToken(user._id);

  // Delete password from response
  delete user._doc.password;
  // send response to client server
  res.status(201).json({ data: user, token });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1)get user by an email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your Skin Safe Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n Skin Safe Team`;
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
  res.status(200).json({
    status: "success",
    message: "Reset code sent to your email",
  });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  //verfy code
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }
  //2)reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset code verified",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //sure code vervied and set newpass completely
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
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
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)//decoded has 3 part 1.userId 2.iat (timestamp created) 3.exp (expired at)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); //If i write  invalid talken or expired return error it handle in error file

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId); //check if user deleted or not active now with this taken
  if (!currentUser || !currentUser.active) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist nor acticate",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
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
