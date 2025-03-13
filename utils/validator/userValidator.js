const slugify = require("slugify");
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters ")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("phoneNumber")
    .notEmpty()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number only allowed EGY and SA number")
    .custom((val) =>
      User.findOne({ phoneNumber: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Phone Number already in use"));
        }
      })
    ),

  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth required")
    .matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
    .withMessage("Date of birth must be in DD-MM-YYYY format"),

  check("email")
    .isEmail()
    .withMessage("Invalid Email address")
    .notEmpty()
    .withMessage("Email required")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      })
    ),
  validatorMiddleware,
];

exports.idUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID is not valid"),
  validatorMiddleware,
];
