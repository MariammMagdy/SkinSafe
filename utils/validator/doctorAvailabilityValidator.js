const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const slugify = require("slugify");

// 🟢 Create Validator
exports.createDoctorAvailabilityValidator = [
    check("doctor")
        .notEmpty()
        .withMessage("Doctor ID is required")
        .isMongoId()
        .withMessage("Invalid Doctor ID format"),

    body("availability")
        .isArray({ min: 1 })
        .withMessage("Availability must be a non-empty array"),

    body("availability.*.day")
        .notEmpty()
        .withMessage("Day is required"),

    body("availability.*.timeSlots")
        .isArray({ min: 1 })
        .withMessage("timeSlots must be a non-empty array"),

    body("availability.*.timeSlots.*")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Each timeSlot must be in HH:MM format"),

    // ✨ Inject slug into req.body
    (req, res, next) => {
        if (Array.isArray(req.body.availability)) {
            req.body.availability = req.body.availability.map((entry) => ({
            ...entry,
            slug: slugify(entry.day, { lower: true }),
            }));
        }
        next();
    },

    validatorMiddleware,
];

// 🟡 Update Validator
exports.updateDoctorAvailabilityValidator = [
    check("id").optional().isMongoId().withMessage("Invalid Doctor Availability ID format"),

    body("availability").optional().isArray().withMessage("Availability must be an array"),

    body("availability.*.day").optional().notEmpty().withMessage("Day is required"),

    body("availability.*.timeSlots")
        .optional()
        .isArray()
        .withMessage("timeSlots must be an array"),

    body("availability.*.timeSlots.*")
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Each timeSlot must be in HH:MM format"),

    // Inject slug during update as well
    (req, res, next) => {
        if (Array.isArray(req.body.availability)) {
            req.body.availability = req.body.availability.map((entry) => ({
            ...entry,
            slug: slugify(entry.day, { lower: true }),
            }));
        }
        next();
    },

    validatorMiddleware,
];
