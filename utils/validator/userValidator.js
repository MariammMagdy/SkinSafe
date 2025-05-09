const slugify = require("slugify");
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");
exports.createUserValidator = [
  check("name").notEmpty().withMessage("Name is required"),

  check("userName")
    .notEmpty()
    .withMessage("User name is required")
    .custom((val) =>
      User.findOne({ userName: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("User Name already in use"));
        }
      })
    ),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .custom((value) => {
      // نحول "15-05-2003" لتاريخ
      const [day, month, year] = value.split("-");
      const isoDate = new Date(`${year}-${month}-${day}`);
      if (isoDate.toString() === "Invalid Date") {
        throw new Error("Invalid date format. Expected format: DD-MM-YYYY");
      }
      return true;
    }),
  check("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female"])
    .withMessage("Gender must be either male or female"),

  check("skinTone")
    .notEmpty()
    .withMessage("Skin tone is required")
    .isIn(["light", "light to medium", "medium", "medium to dark", "dark"])
    .withMessage("Invalid skin tone value"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

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

  check("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth required")
    .isISO8601(),

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
