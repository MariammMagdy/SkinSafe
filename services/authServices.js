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
  // حذف كود تحقق قديم لو موجود
  const check = await Verification.findOne({ email: req.body.email });
  if (check) {
    await Verification.deleteOne({ _id: check._id });
  }

  // هاش للباسورد
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  // إعداد fcmToken كمصفوفة
  const fcmTokens = req.body.fcmToken ? [req.body.fcmToken] : [];

  // إنشاء مستخدم جديد مع fcmToken Array
  const user = await User.create({
    name: req.body.name,
    userName: req.body.userName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    skinTone: req.body.skinTone,
    password: hashedPassword,
    fcmToken: fcmTokens, // ← إضافة المصفوفة
  });

  return res.status(201).json({
    data: sanitizeUser(user),
    message: "success",
  });
});
/*
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
*/
// @desc    Login
// @route   GET /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // البحث عن المستخدم
  const user = await User.findOne({ email: req.body.email });

  // التحقق من الإيميل والباسورد
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // تحديث fcmToken لو موجود في الطلب
  if (req.body.fcmToken) {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { fcmToken: req.body.fcmToken } } // إضافة بدون تكرار
    );
  }

  // إنشاء التوكن
  const token = createToken(user._id);

  // تحديث نسخة user بعد تعديل fcmToken
  const updatedUser = await User.findById(user._id);

  // إرجاع البيانات
  return res.status(200).json({
    data: sanitizeUser(updatedUser),
    token,
    message: "success",
  });
});

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
  console.log("User from DB:", currentUser);

  req.user = currentUser;
  next();
});

// التحقق من صلاحيات المستخدم
exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("Role trying to access route:", req.user.role);
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  };
};
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
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
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

  const message = `Hi ${user.name},\n We received a request to reset the password on your Skin Safe Account.\n ${resetCode}\n Enter this code to complete the reset.\n Thanks for helping us keep your account secure.\n Skin Safe Team`;

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
