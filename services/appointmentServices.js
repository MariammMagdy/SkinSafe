const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

// 📌 Create Appointment
exports.createAppointment = asyncHandler(async (req, res, next) => {
    delete req.body.patient;
    const patient = await User.findOne({email:req.user.email});//findById(req.user.id);
    if (!patient) {
        return next(new ApiError(`No user found with id ${req.user.id}`, 404));
    }
    const { doctor, date, timeSlot } = req.body;

    const existing = await Appointment.findOne({ doctor, date, timeSlot });
    if (existing) {
        return next(new ApiError("This slot is already booked", 400));
    }

    const appointment = await Appointment.create({
        doctor,
        patient: req.user.id,
        date,
        timeSlot,
    });
    res.status(201).json({ data: appointment });
});

/*// 📌 Create Appointment
exports.createAppointment = asyncHandler(async (req, res, next) => {
    const { doctor, patient, date, timeSlot } = req.body;

    const existing = await Appointment.findOne({ doctor, date, timeSlot });
    if (existing) {
        return next(new ApiError("This slot is already booked", 400));
    }

    const appointment = await Appointment.create({ doctor, patient, date, timeSlot });
    res.status(201).json({ data: appointment });
    });*/

// 📌 Get All Appointments
exports.getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find()
        .populate("doctor", "firstName secondName specialty")
        .populate("patient", "name email");

        res.status(200).json({ results: appointments.length, data: appointments });
    });

// 📌 Get Appointment by ID
exports.getAppointmentById = asyncHandler(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate("doctor")
        .populate("patient");

    if (!appointment) {
        return next(new ApiError("No appointment found for this ID", 404));
    }

    res.status(200).json({ data: appointment });
});

// 📌 Update Appointment
exports.updateAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!appointment) {
        return next(new ApiError("No appointment found to update", 404));
    }

    res.status(200).json({ data: appointment });
});

// 📌 Delete Appointment
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
        return next(new ApiError("No appointment found to delete", 404));
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
});
