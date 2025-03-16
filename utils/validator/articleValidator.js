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
    .withMessage("Content is required")
    .isLength({ min: 10, max: 5000 }).withMessage('Article content must be between 10 to 5000 characters'),
  body("author").notEmpty().withMessage("author is required"),
  validatorMiddleware,
];

exports.updateArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Article id format"),
  body("content").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteArticleValidator = [
  check("id").isMongoId().withMessage("Invalid Article id format"),
  validatorMiddleware,
];
