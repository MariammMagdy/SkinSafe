const express = require("express");
const {
    createDoctorAvailabilityValidator,
    updateDoctorAvailabilityValidator,
} = require("../utils/validator/doctorAvailabilityValidator");

const {
    createAvailability,
    getAvailabilityByDoctor,
    updateAvailability,
} = require("../services/doctorAvailabilityServices");

const router = express.Router();

router
    .route("/:doctorId")
    .get(getAvailabilityByDoctor) // Get availability for a specific doctor
    .put(updateDoctorAvailabilityValidator, updateAvailability); 

router
    .route("/")
    .post(createDoctorAvailabilityValidator, createAvailability); 

module.exports = router;
