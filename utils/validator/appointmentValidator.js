const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  validatorMiddleware,
];

exports.createAppointmentValidator = [
  body("doctorName").notEmpty().withMessage("Doctor name is required"),
  body("status").notEmpty().withMessage("Status  is required"),
  body("specialization")
    .isLength({ min: 10, max: 150 })
    .withMessage("Invalid Specialization format"),
  body("location").notEmpty().withMessage(" Location  is required"),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("time").isISO8601().withMessage("Invalid time format"),
  body("image").notEmpty().withMessage("Image is required"),
  body("patientName").notEmpty().withMessage("patient name is required"),
  body("contact").notEmpty().withMessage("Contact is required"),
  body("comments"),
  validatorMiddleware,
];

exports.updateAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  body("doctorName").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  validatorMiddleware,
];
