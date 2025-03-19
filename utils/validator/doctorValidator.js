const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createDoctorValidator = [
    check('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({min: 2})
        .withMessage('Too short first name for a doctor')
        .isLength({max: 100})
        .withMessage('Too long first name for a doctor'),
    check('secondName')
        .notEmpty()
        .withMessage('Second name is required')
        .isLength({min: 2})
        .withMessage('Too short second name for a doctor')
        .isLength({max: 100})
        .withMessage('Too long second name for a doctor'),
    check('specialty')
        .notEmpty()
        .withMessage('Specialty is required')
        .isLength({min: 3})
        .withMessage('Too short specialty name for a doctor')
        .isLength({max: 50})
        .withMessage('Too long specialty name for a doctor'),
    check('experience')
        .notEmpty()
        .withMessage('Experience years field is required')
        .isNumeric()
        .withMessage('Experience years must be a number')
        .isInt({ min: 1 })
        .withMessage('Experience must be at least 1 year')
        .isInt({ max: 100 })
        .withMessage('Experience must not exceed 50 years'),
    check('about')
        .notEmpty()
        .withMessage('About section is required')
        .isLength({min: 10})
        .withMessage('Too short about section for a doctor')
        .isLength({max: 50000})
        .withMessage('Too long about section for a doctor'),
    check('image')
        .notEmpty
        .withMessage('Image is required'),
    check('certificate')
        .notEmpty()
        .withMessage('Certificate field is required')
        .isLength({min: 10})
        .withMessage('Too short certificate section for a doctor')
        .isLength({max: 5000})
        .withMessage('Too long certificate section for a doctor'),,
    validatorMiddleware,
];

exports.getDoctorValidator = [
    check('id').isMongoId().withMessage('Invalid doctor id format'),
    validatorMiddleware,
];

exports.updateDoctorValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid doctor id format'),
    check('experience')
        .isNumeric()
        .withMessage('Experience must be a number')
        .isInt({ min: 1 })
        .withMessage('Experience must be at least 1 year')
        .isInt({ max: 100 })
        .withMessage('Experience must not exceed 50 years'),
    check('about')
        .optional()
        .withMessage('About field is required')
        .isLength({min: 10})
        .withMessage('Too short about section for a doctor')
        .isLength({max: 50000})
        .withMessage('Too long about section for a doctor'),
    check('image')
        .optional()
        .withMessage('Image is required'),
    check('certificate')
        .optional()
        .withMessage('Certificate field is required')
        .isLength({min: 10})
        .withMessage('Too short certificate section for a doctor')
        .isLength({max: 5000})
        .withMessage('Too long certificate section for a doctor'),,
    validatorMiddleware
];

exports.deleteDoctorValidator = [
    check('id').isMongoId().withMessage('Invalid cdoctor id format'),
    validatorMiddleware
];

