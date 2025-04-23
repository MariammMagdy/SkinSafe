const DoctorAvailability = require("../models/DoctorAvailability");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const slugify = require("slugify");

// ➕ Create availability
exports.createAvailability = asyncHandler(async (req, res, next) => {
    // Ensure availability has the slug field generated for each day
    req.body.availability = req.body.availability.map((entry) => ({
        ...entry,
        slug: slugify(entry.day, { lower: true }), // Inject slug for each availability day
    }));

    const availability = await DoctorAvailability.create(req.body);
    res.status(201).json(availability);
});

// ✏️ Update availability
exports.updateAvailability = asyncHandler(async (req, res, next) => {
    // Ensure slug is updated for each availability day if availability data is provided
    if (req.body.availability) {
        req.body.availability = req.body.availability.map((entry) => ({
        ...entry,
        slug: slugify(entry.day, { lower: true }), // Generate slug for updated availability
        }));
    }

    const updated = await DoctorAvailability.findOneAndUpdate(
        { doctor: req.params.doctorId },
        req.body,
        { new: true, runValidators: true, upsert: true }
    );

    if (!updated) {
        return next(new ApiError("Doctor availability not found", 404));
    }

    res.status(200).json(updated);
});

// 🔍 Get by doctor ID
exports.getAvailabilityByDoctor = asyncHandler(async (req, res, next) => {
    const availability = await DoctorAvailability.findOne({
        doctor: req.params.doctorId,
    });

    if (!availability) {
        return next(new ApiError("Availability not found for this doctor", 404));
    }

    res.status(200).json(availability);
});
