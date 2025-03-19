const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    secondName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
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
      maxlength: 50000,
    },
    certificate: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    image: {
      type: String,
      required: true,
    },
    day: [
      {
        type: {
          type: String,
          enum: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          required: true,
        },
        slots: [
          {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

doctorSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "doctor",
  localField: "_id",
});


module.exports = mongoose.model("Doctor", doctorSchema);
