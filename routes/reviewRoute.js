const express = require("express");
const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const {
  getReview,
  getReviews,
  getDoctorReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setDoctorIdAndUserIdToBody,
} = require("../services/reviewServices");

const authService = require("../services/authServices");

const router = express.Router({ mergeParams: true });

// ⚡ ضعه قبل أي راوت فيه ":id"
router.route("/doctorReviews/:id").get(getReviewValidator, getDoctorReviews);

// بعدها الباقي
router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setDoctorIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
