const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const Doctor = require("../models/doctorModel");
const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

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
  if (!req.body.doctor) req.body.product = req.params.doctorId;
  if (!req.body.user) req.body.user = req.user._Id;
  next();
};

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return next(new ApiError("User ID is required", 400));
  }

  req.body.user = req.user._id;

  if (!req.body.doctor) {
    return next(new ApiError("Doctor ID is required", 400));
  }

  const doctorExists = await Doctor.findById(req.body.doctor);
  if (!doctorExists) {
    return next(new ApiError("Doctor not found", 404));
  }

  const lastReview = await Review.findOne({
    user: req.user._id,
    doctor: req.body.doctor,
  });

  if (lastReview) {
    return next(
      new ApiError("You already posted a review for this doctor", 400)
    );
  }

  const review = await Review.create(req.body);
  res.status(201).json({ data: sanitizeReview(review) });
});
// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = factory.updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = factory.deleteOne(Review);
