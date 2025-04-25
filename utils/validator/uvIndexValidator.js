const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

// ✅ Validator for create UV Index (لو حبيت تضيفي فاليشن قبل الـ create)
exports.createUVIndexValidator = [
    check("lat")
        .notEmpty()
        .withMessage("Latitude is required")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude should be a valid float value between -90 and 90."),
  
    check("lon")
        .notEmpty()
        .withMessage("Longitude is required")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude should be a valid float value between -180 and 180."),

    check("locationName")
        .notEmpty()
        .withMessage("Location name is required")
        .isString()
        .withMessage("Location name must be a string"),

  validatorMiddleware,
];



