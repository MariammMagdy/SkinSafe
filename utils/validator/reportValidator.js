const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createReportValidator = [
  check('scannedImage').notEmpty().withMessage('The photo is required'),
  validatorMiddleware,
];

exports.getReportValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
];

exports.deleteReportValidator = [
  check('id').isMongoId().withMessage('Invalid report id format'),
  validatorMiddleware,
];

