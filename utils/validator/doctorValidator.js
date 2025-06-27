const slugify = require("slugify");
const { check, body} = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createDoctorValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("Too short first name for a doctor")
    .isLength({ max: 100 })
    .withMessage("Too long first name for a doctor"),
  check("secondName")
    .notEmpty()
    .withMessage("Second name is required")
    .isLength({ min: 2 })
    .withMessage("Too short second name for a doctor")
    .isLength({ max: 100 })
    .withMessage("Too long second name for a doctor"),
  check("specialty")
    .notEmpty()
    .withMessage("Specialty is required")
    .isLength({ min: 3 })
    .withMessage("Too short specialty name for a doctor")
    .isLength({ max: 200 })
    .withMessage("Too long specialty name for a doctor"),
  check("experience")
    .notEmpty()
    .withMessage("Experience years field is required")
    .isNumeric()
    .withMessage("Experience years must be a number")
    .isInt({ min: 1 })
    .withMessage("Experience must be at least 1 year")
    .isInt({ max: 50 })
    .withMessage("Experience must not exceed 50 years"),
  check("about")
    .notEmpty()
    .withMessage("About section is required")
    .isLength({ min: 10 })
    .withMessage("Too short about section for a doctor")
    .isLength({ max: 50000 })
    .withMessage("Too long about section for a doctor"),
  check("image").notEmpty().withMessage("Image is required"),
  check("certificate")
    .notEmpty()
    .withMessage("Certificate field is required")
    .isLength({ min: 10 })
    .withMessage("Too short certificate section for a doctor")
    .isLength({ max: 5000 })
    .withMessage("Too long certificate section for a doctor"),
  validatorMiddleware,
];

exports.getDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),
  validatorMiddleware,
];

exports.updateDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),
  check("experience")
    .optional()
    .isNumeric()
    .withMessage("Experience must be a number")
    .isInt({ min: 1 })
    .withMessage("Experience must be at least 1 year")
    .isInt({ max: 50 })
    .withMessage("Experience must not exceed 50 years"),
  check("about")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Too short about section for a doctor")
    .isLength({ max: 50000 })
    .withMessage("Too long about section for a doctor"),
  check("ratingsAverage")
    .optional()
    .isFloat()
    .withMessage("rating average must be a number")
    .custom((value) => {
    if (value < 1) {
      throw new Error("Rating must be at least 1");
    }
    if (value > 5) {
      throw new Error("Rating must not exceed 5");
    }
    return true;
    }),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings Quantity must be a number"),
  check("image").optional(),
  check("certificate")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Too short certificate section for a doctor")
    .isLength({ max: 5000 })
    .withMessage("Too long certificate section for a doctor"),

  // ✅ Validate availability if provided
  body("availability")
    .optional()
    .isArray()
    .withMessage("Availability must be an array"),

  body("availability.*.day")
    .optional()
    .notEmpty()
    .withMessage("Day is required"),

  body("availability.*.timeSlots")
    .optional()
    .isArray()
    .withMessage("timeSlots must be an array"),

  body("availability.*.timeSlots.*")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Each timeSlot must be in HH:MM format"),
  validatorMiddleware,
];

exports.deleteDoctorValidator = [
  check("id").isMongoId().withMessage("Invalid doctor id format"),
  validatorMiddleware,
];
