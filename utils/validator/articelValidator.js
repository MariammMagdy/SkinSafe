const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Article id format"),
  validatorMiddleware,
];

exports.createArticleValidator = [
  body("title").notEmpty().withMessage("Title of Article is required"),
  body("description")
    .notEmpty()
    .withMessage("description  is required")
    .isLength({ min: 10, max: 150 }),
  body("image").notEmpty().withMessage("Image is required"),
  body("content")
    .notEmpty()
    .withMessage("Contact is required")
    .isLength({ min: 10, max: 500 }),
  body("author").body().notEmpty().withMessage("author is required"),
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
