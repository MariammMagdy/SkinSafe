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

// 📌 Get All Appointments
exports.getAllAppointments = asyncHandler(async (req, res) => {
    const patient = await User.findById(req.user._id);//findById(req.user.id);
    if (!patient) {
        return next(new ApiError(`No user found with id ${req.user.id}`, 404));
    }
    const appointments = await Appointment.find({patient:patient})
        .populate({ path: "doctor", select: "firstName secondName specialty", options: { virtuals: false }, })
        //.populate("doctor", "firstName secondName specialty")
        .populate("patient", "name email")//;
        .lean();

        res.status(200).json({ results: appointments.length, data: appointments });
    });

// 📌 Get Appointment by ID
exports.getAppointmentById = asyncHandler(async (req, res, next) => {
    const patient = await User.findById(req.user._id);
    if (!patient) {
        return next(new ApiError(`No user found with id ${req.user.id}`, 404));
    }
    const appointment = await Appointment.findOne({
        _id: req.params.id,
        patient: patient,
    })
    .populate("doctor")
    .populate("patient");

    if (!appointment) {
        return next(new ApiError("No appointment found for this ID or user", 404));
    }

    res.status(200).json({ data: appointment });
});

// 📌 Update Appointment
exports.updateAppointment = asyncHandler(async (req, res, next) => {
    const patient = await User.findById(req.user._id);
    if (!patient) {
        return next(new ApiError(`No user found with id ${req.user.id}`, 404));
    }
    const appointment = await Appointment.findOneAndUpdate(
    {
        _id: req.params.id,
        patient: patient,
    },
    req.body,
    { new: true, runValidators: true }
    );

    if (!appointment) {
        return next(
            new ApiError("No appointment found for this ID or user to update", 404)
        );
    }

    res.status(200).json({ data: appointment });
});

// 📌 Delete Appointment
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
    const patient = await User.findById(req.user._id);
    if (!patient) {
        return next(new ApiError(`No user found with id ${req.user.id}`, 404));
    }
    const appointment = await Appointment.findOneAndDelete({
        _id: req.params.id,
        patient: patient,
    });
    if (!appointment) {
        return next(
        new ApiError("No appointment found for this ID or user to delete", 404)
        );
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
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
});*/
