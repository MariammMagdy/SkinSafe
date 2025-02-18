const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    doctor: String,
    status: String,
    date: String,
    specialization: String,
    location: String,
    image: String,
  },
  { timestamps: true }
);
//or

module.exports = mongoose.model("Appointment", AppointmentSchema);
