const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Article id format"),
  validatorMiddleware,
];

exports.createArticleValidator = [
  body("title").notEmpty().withMessage("Title of Article is required"),
  body("image").notEmpty().withMessage("Image is required"),
  body("content")
    .notEmpty()
    .withMessage("Contact is required")
    .isLength({ min: 10, max: 5000 }),
  body("author").notEmpty().withMessage("author is required"),
  validatorMiddleware,
];

exports.updateArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  body("content").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  validatorMiddleware,
];
