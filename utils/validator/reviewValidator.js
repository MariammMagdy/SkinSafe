const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("rating")
    .notEmpty()
    .withMessage("rating value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid Review id format"),
  check("doctor")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      //check if logged user create review before
      Review.findOne({ user: req.user._id, doctor: req.body.doctor }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("You already created a review before")
            );
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      //check review ownership before updating
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review with this id ${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not to allowed to update this review")
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      //check review ownership before updating
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with this id ${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not to allowed to update this review")
            );
          }
        });
      }
      return true;
    }),

  validatorMiddleware,
];
