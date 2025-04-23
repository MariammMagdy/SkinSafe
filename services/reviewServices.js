const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

//Nested route
//GET /api/v1/products/productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.doctorId) filterObject = { product: req.params.doctorId };
  req.filterObj = filterObject;
  next();
};
// @desc    Get list of Reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

//Nested Route
exports.setDoctorIdAndUserIdToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.user) req.body.user = req.user._Id;
  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = factory.deleteOne(Review);

/*
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.doctorId) filterObject = { doctor: req.params.doctorId };
  req.filterObj = filterObject;
  next();
};

exports.setDoctorIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.user) {
    if (!req.user) {
      return next(new ApiError("User not found. Please login first.", 401));
    }
    req.body.user = req.user._id;
  }
  next();
};

exports.getReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.createReview = async (doctorId, userId, rating, comment) => {
  // التحقق إذا كان المستخدم قد كتب تقييمًا للطبيب
  const existingReview = await Review.findOne({ doctorId, userId });

  if (existingReview) {
    throw new Error("لقد قمت بكتابة تقييم لهذا الطبيب من قبل");
  }

  // إنشاء تقييم جديد
  const review = new Review({
    doctorId,
    userId,
    rating,
    comment,
  });

  return await review.save();
};

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
*/
