const express = require("express");

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
    .post(createAppointmentValidator, createAppointment)
    .get(getAllAppointments);

router
    .route("/:id")
    .get(getAppointmentValidator, getAppointmentById)
    .put(updateAppointmentValidator, updateAppointment)
    .delete(deleteAppointmentValidator, deleteAppointment);

module.exports = router;
