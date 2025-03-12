const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const CryptoJs = require("crypto-js");
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
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

  const hashResetCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  // Send verification code to the user's email (as done before)
  const message = `Hi ${req.body.fullName},\nWe received a request to verify your SkinSafe Account.\n${verificationCode}\nEnter this code to complete the verify.\nThanks for helping us keep your account secure.\nThe SkinSafe Team `;

  //send Verification code to the user email
  try {
    await sendEmail({
      email: req.body.email,
      subject: "Email Verification Code (valid for 10 min)",
      message,
    });
    // msh fahma dee
    const { passwordConfirm, password, ...tempUserData } = req.body;
    // تحقق إذا كانت كلمة المرور موجودة ثم عمل هاش لها
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      // تخزين كلمة المرور المجهزة (المشفرّة) في البيانات
      tempUserData.password = hashedPassword;
    } // Save the code and temp data in the database
    const verification = await Verification.create({
      email: req.body.Email,
      code: hashResetCode,
      expiresAt: new Date(expirationTime),
      tempUserData: tempUserData,
    });
    // Generate and send token
    const token = createToken(user._id);
    res.status(200).json({
      status: "success",
      message: "Verification code sent to your email.",
      token,
    });
  } catch (error) {
    return next(new ApiError("There is an error in sending email", 500));
  }
});

exports.verifyEmailUser = asyncHandler(async (req, res, next) => {
  const check = await Verification.findById(req.code._id);
  const { code } = req.body;
  const hashResetCode = crypto.createHash("sha256").update(code).digest("hex");
  const email = check.email;
  const verificationRecord = await Verification.findOne({
    email,
    code: hashResetCode,
  });
  if (!verificationRecord) {
    return next(new ApiError("Invalid verification code", 400));
  }
  const date = Date.now();
  // Create the user in the database
  const user = await User.create({
    ...verificationRecord.tempUserData, // نسخ جميع البيانات من tempStudentData
    passwordChangeAt: date,
  });
  // Clear verification record
  await Verification.deleteOne({ _id: verificationRecord._id });

  const token = createToken(user._id);

  res.status(201).json({
    status: "success",
    data: sanitizeUser(user),
    token,
  });
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
  return res.status(201).json({
    data: sanitizeUser(user),
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  //4)check the user is active or no
  if (!currentUser.active) {
    return next(
      new ApiError("The user that belong to this token no active now"),
      401
    );
  }
  //5) check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt / 1000,
      10
    );
    //Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("Your password has changed recently, please login again"),
        401
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.protectforget = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  token = CryptoJs.AES.decrypt(token, process.env.HASH_PASS);
  token = token.toString(CryptoJs.enc.Utf8);
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentUser = await User.findById(decoded.userId);
  // console.log(currentUser.passwordChangeAt.getTime());
  if (!currentUser) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  //4)check the user is active or no
  if (!currentUser.active) {
    return next(
      new ApiError("The user that belong to this token no active now"),
      401
    );
  }
  //5) check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt / 1000,
      10
    );
    //Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("Your password has changed recently, please login again"),
        401
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.protectCode = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentCode = await Verification.findById(decoded.userId);
  // console.log(currentUser.passwordChangeAt.getTime());
  if (!currentCode) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  if (Date.now() > currentCode.expiresAt) {
    return next(new ApiError("Verification code expired", 400));
  }

  req.code = currentCode;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1) access roles
    //2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this this route", 403)
      );
    }
    next();
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
  token = createToken(user._id);
  token = CryptoJs.AES.encrypt(token, 10).toString();

  res.status(200).json({
    status: "success",
    message: "Reset code sent to your email",
    token,
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
  const user = await User.findById(req.user._id);
  if (
    user.passwordResetCode != hashResetCode ||
    user.passwordResetExpires <= Date.now()
  ) {
    return next(new ApiError("Reset code invalid or expired"), 401);
  }
  //2)reset code valid
  user.passwordResetVerified = true;
  await user.save();
  const token = req.headers.authorization;

  res.status(200).json({
    status: "success",
    message: "Reset code verified",
    token,
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

  const { newPassword } = req.body;

  // تحقق إذا كانت كلمة المرور موجودة ثم عمل هاش لها
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // تخزين كلمة المرور المجهزة (المشفرّة) في البيانات
    user.password = hashedPassword;
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
