const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid Doctor id format"),
  validatorMiddleware,
];

exports.createDoctorValidator = [validatorMiddleware];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Doctor id format"),
  body("doctorName").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid Doctor id format"),
  validatorMiddleware,
];
