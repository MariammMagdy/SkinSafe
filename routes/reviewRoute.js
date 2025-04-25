const express = require("express");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const authservice = require("../services/authServices");

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setDoctorIdAndUserIdToBody,
} = require("../services/reviewServices");

const router = express.Router();

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authservice.protect,
    authservice.allowedTo("user"),
    setDoctorIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authservice.protect,
    authservice.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authservice.protect,
    authservice.allowedTo("admin", "user", "manger"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
