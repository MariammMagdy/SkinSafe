const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const DoctorAvailability = require("../../models/doctorAvailability");
const Appointment = require("../../models/appointmentModel");
const mongoose = require("mongoose");


exports.createAppointmentValidator = [
  check("doctor")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Invalid Doctor ID format"),

  /*check("patient")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Invalid Patient ID format"),*/

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  check("timeSlot")
    .notEmpty()
    .withMessage("Time slot is required")
    .custom(async (value, { req }) => {
      const doctorId = req.body.doctor;
      const date = new Date(req.body.date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      // Step 1: Check timeSlot is available
      const availability = await DoctorAvailability.findOne({ doctor: doctorId });
      if (!availability) {
        throw new Error("No availability found for this doctor");
      }

      const day = availability.availability.find(
        (d) => d.day.toLowerCase() === dayName.toLowerCase()
      );

      if (!day || !day.timeSlots.includes(value)) {
        throw new Error(`Invalid time slot for ${dayName}`);
      }

      // Step 2: Check if timeSlot is already reserved
      const exists = await Appointment.findOne({
        doctor: doctorId,
        date: date,
        timeSlot: value,
      });

      if (exists) {
        throw new Error("This time slot is already reserved for this doctor");
      }

      return true;
    }),

  validatorMiddleware,
];

exports.updateAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid appointment id format"),

  body("doctor")
    .optional()
    .isMongoId()
    .withMessage("Invalid doctor id format")
    .custom(async (val, { req }) => {
      // Checks for doctor, date and timeslot
      const doctor = val || req.body.doctor;
      const date = req.body.date;
      const timeSlot = req.body.timeSlot;

      if (doctor && date && timeSlot) {
        // ensures that this timeslot isn't reserved
        const existing = await Appointment.findOne({
          doctor,
          date,
          timeSlot,
          _id: { $ne: req.params.id }, 
        });

        if (existing) {
          throw new Error("This slot is already booked for this doctor");
        }

        // checks if this timeslot is available for this doctor or not
        const availability = await DoctorAvailability.findOne({ doctor });

        if (!availability) {
          throw new Error("No availability found for this doctor");
        }

        const day = new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
        }).toLowerCase();

        const matchingDay = availability.availability.find(
          (entry) => entry.day.toLowerCase() === day
        );

        if (!matchingDay || !matchingDay.timeSlots.includes(timeSlot)) {
          throw new Error(
            "This time slot is not available for the selected doctor on this day"
          );
        }
      }

      return true;
    }),

  body("date").optional().isISO8601().toDate(),

  body("timeSlot").optional().isString(),

  validatorMiddleware,
];

exports.getAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid appointment ID"),
  validatorMiddleware,
];

exports.deleteAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid appointment ID"),
  validatorMiddleware,
];




















/*const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.getAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  validatorMiddleware,
];

exports.createAppointmentValidator = [
  body("doctorName").notEmpty().withMessage("Doctor name is required"),
  body("status").notEmpty().withMessage("Status  is required"),
  body("specialization")
    .isLength({ min: 10, max: 150 })
    .withMessage("Invalid Specialization format"),
  body("location").notEmpty().withMessage(" Location  is required"),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("time").isISO8601().withMessage("Invalid time format"),
  body("image").notEmpty().withMessage("Image is required"),
  body("patientName").notEmpty().withMessage("patient name is required"),
  body("contact").notEmpty().withMessage("Contact is required"),
  body("comments"),
  validatorMiddleware,
];

exports.updateAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  body("doctorName").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteAppointmentValidator = [
  check("id").isMongoId().withMessage("Invalid Appointment id format"),
  validatorMiddleware,
];*/
