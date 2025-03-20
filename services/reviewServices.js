const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

//Nested route
//GET /api/v1/products/productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { doctor: req.params.doctorId };
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
exports.setProductIdAndUserIdToBody = (req, res, next) => {
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
