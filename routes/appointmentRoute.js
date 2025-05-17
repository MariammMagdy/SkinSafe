const express = require("express");
const authService = require("../services/authServices");

const {
    getAppointmentValidator,
    createAppointmentValidator,
    updateAppointmentValidator,
    deleteAppointmentValidator,
} = require("../utils/validator/appointmentValidator");

const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
} = require("../services/appointmentServices");

const router = express.Router();

router
    .route("/")
    .post(createAppointmentValidator,authService.protect, authService.allowedTo("user"), createAppointment)
    .get(authService.protect, authService.allowedTo("user"), getAllAppointments);

router
    .route("/:id")
    .get(getAppointmentValidator, getAppointmentById)
    .put(updateAppointmentValidator, updateAppointment)
    .delete(deleteAppointmentValidator, deleteAppointment);

module.exports = router;
