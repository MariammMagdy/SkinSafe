const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

// Nested route
// GET /api/v1/doctors/:doctorId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.doctorId) filterObject = { doctor: req.params.doctorId }; // ✅ تم التعديل هنا
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// Nested route (Create)
// Set doctorId and userId in body automatically if not sent
exports.setDoctorIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);

// @desc    Get all reviews for a specific doctor
// @route   GET /api/v1/doctors/:id/reviews
// @access  Public
exports.getDoctorReviews = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;

  const reviews = await Review.find({ doctor: doctorId }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    results: reviews.length,
    data: reviews,
  });
});

/*
const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.doctorId) filterObject = { product: req.params.doctorId };
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// Nested route (Create)
exports.setDoctorIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.doctor) req.body.doctor = req.params.doctorId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);

exports.getDoctorReviews = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;

  const reviews = await Review.find({ doctor: doctorId });

  res.status(200).json(reviews);
});
*/
