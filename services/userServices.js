const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middleware/uploadImageMilddleware");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const { sanitizeUser, sanitizeUsers } = require("../utils/sanitizeData");
// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // جلب الـ ID من الرابط
  const document = await User.findById(id); // البحث عن المستخدم باستخدام الـ ID

  if (!document) {
    // إذا ما كانش في مستخدم بالـ ID ده
    return next(new ApiError(`No document for this id ${id}`, 404));
  }

  // إرجاع البيانات للمستخدم بعد ما ننظفها باستخدام sanitizeUser
  res.status(200).json({ data: sanitizeUser(document) });
});

// @desc    Get information of logged user
// @route   GET /users/getMe
// @access  Private/user

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ApiError(`No user found with id ${req.user.id}`, 404));
  }

  res.status(200).json({ data: sanitizeUser(user) });
});

// @desc    Get all users
// @route   GET /users/all
// @access  Private/user

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  if (!users.length) {
    return next(new ApiError(`No users found`, 404));
  }
  res.status(200).json({ results: users.length, data: sanitizeUsers(users) });
});

exports.getAllAdmins = asyncHandler(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        role: "admin", // تحديد فقط المستخدمين الذين لديهم الدور "user"
      },
    },
    {
      $project: {
        fullName: 1,
        Phone: 1,
        Email: 1,
        _id: 1,
      },
    },
  ]);

  if (!users.length) {
    return next(new ApiError(`No users found`, 404));
  }

  res.status(200).json({ results: users.length, data: users });
});

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = (User) =>
  asyncHandler(async (req, res) => {
    const {
      name,
      userName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      skinTone,
      password,
    } = req.body;

    const newUser = await User.create({
      name,
      userName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      skinTone,
      password,
    });
    console.log(newUser);
    res.status(201).json({ data: newUser });
  });

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin

exports.CreateAdmin = asyncHandler(async (req, res, next) => {
  const { fullName, Email, password, Phone } = req.body;
  const saltRounds = parseInt(process.env.HASH_PASS, 10); // عدد الـ salt rounds من البيئة
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const admin = await User.create({
    fullName,
    Email,
    password: hashedPassword,
    Phone,
    role: "admin",
  });
  const token = createToken(admin._id);
  res.status(201).json({ data: admin, token });
});

exports.deleteUserAndAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  res.status(204).json({ msg: "Deleted" });
});
// @desc    Update user without password or role
// @route   PUT /users/updateMe
// @access  Private/user
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updateData = {};

  // خدي الحقول اللي موجودة فعلاً في الـ req.body
  const allowedFields = [
    "name",
    "userName",
    "phoneNumber",
    "dateOfBirth",
    "gender",
    "skinTone",
    "email",
    "password",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  res.status(200).json({ data: sanitizeUser(user) });
});

/* exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      userName: req.body.userName,
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      skinTone: req.body.skinTone,
      email: req.body.email,
      password: req.body.password,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No user for this id ${req.user.id}`, 404));
  }
  res.status(200).json({ data: sanitizeUser(user) });
});
 */
// @desc    Update user  role
// @route   PUT /users/updateRole/:id
// @access  Private/admin

exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  const newRole = user.role === "admin" ? "user" : "admin";
  await User.findByIdAndUpdate(
    req.params.id,
    {
      role: newRole,
    },
    {
      new: true,
    }
  );

  res.status(204).json({ msg: "Role updated" });
});

// @desc    Deactvate logged user
// @route   PUT /users/deactvateMe
// @access  Private/protect

exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    {
      new: true,
    }
  );

  res.status(204).json({ message: "Deactivated" });
});

// @desc    Reactivate a user
// @route   PUT /users/reactivate/:id
// @access  Private/admin
exports.reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user found with id ${req.params.id}`, 404));
  }

  await User.findByIdAndUpdate(req.params.id, { active: true }, { new: true });

  res.status(200).json({ msg: "User reactivated" });
});

// @desc    Get all deactivated users
// @route   GET /users/deactivated
// @access  Private/admin
exports.getDeactivatedUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ active: false });
  if (!users.length) {
    return next(new ApiError(`No deactivated users found`, 404));
  }
  res.status(200).json({ results: users.length, data: sanitizeUsers(users) });
});

// @desc    Delete logged user
// @route   DELETE /users/deleteMyAccount
// @access  Private/protect

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);

  if (!user) {
    return next(new ApiError("No user found", 404));
  }

  return res.status(200).json({
    status: "success",
    msg: `${user.userName} deleted successfully.`,
  });
});

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const { oldPassword, newPassword } = req.body;

  // التحقق من كلمة المرور القديمة
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new ApiError("Incorrect old password", 401));
  }

  // تحديث كلمة المرور
  const saltRounds = parseInt(process.env.HASH_PASS, 10);
  user.password = await bcrypt.hash(newPassword, saltRounds);

  // تحديث passwordChangeAt
  user.passwordChangeAt = Date.now();

  await user.save();

  // إنشاء توكن جديد بعد تحديث كلمة المرور
  const token = createToken(user._id);

  res.status(200).json({
    msg: "Password updated successfully",
    token,
  });
});
