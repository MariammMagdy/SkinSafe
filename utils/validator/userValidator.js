/*
const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.createUserValidator = [validatorMiddleware];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("doctorName").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

*/
const slugify = require("slugify");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
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
  ,
  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth required")
    .matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
    .withMessage("Date of birth must be in DD-MM-YYYY format"),
  check("gender").notEmpty().withMessage("Gender required"),
  check("skinTone").notEmpty().withMessage("skin Tone required"),
  check("username")
    .notEmpty()
    .withMessage("Username required")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("Username must only contain alphanumeric characters")
    .custom((val) =>
      User.findOne({ username: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Username already in use"));
        }
      })
    ),
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

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("invalid phone number only allowed EGY and SA number"),

  check("profileImg").optional(),

  check("role").optional(),
  validatorMiddleware,
];

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
  ,
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
exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter your Password Confirm "),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      //1)verify a current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("there is no user for this id ");
      }
      //pass1234 === drdtkhilhhvvgv  !!! ezayy
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }
      //2)verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("profileImg").optional(),

  check("role").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),

  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
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
