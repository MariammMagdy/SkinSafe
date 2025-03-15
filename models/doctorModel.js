const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    specialty: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    experience: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be more than or equal to 1.0"],
      max: [5, "Rating must be less than or equal to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },certificate: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
