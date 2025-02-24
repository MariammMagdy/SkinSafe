const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    doctorName: String,
    status: String,
    date: String,
    specialization: String,
    location: String,
    image: String,
    patientName: String,
    contact: String,
    comments: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
