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
      maxlength: 200,
    },
    experience: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
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
    day: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Define virtual field for reviews
doctorSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "doctor",
  localField: "_id",
});
/*
// ✅ Optional: populate reviews automatically when finding doctor
// (لو مش محتاجها دائمًا، شيلها)
doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "reviews",
    select: "rating comment", // <-- عدّل حسب الحقول اللي محتاجها
  });
  next();
});
*/
// Define virtual field for availability

doctorSchema.virtual("availability", {
  ref: "DoctorAvailability",
  foreignField: "doctor",
  localField: "_id",
});
/*
doctorSchema.pre(/^find/, function (next) {
  this.populate("availability"); // <-- ضيفي دي مع باقي الـ populate زي reviews
  next();
});
*/
doctorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "reviews",
    select: "rating comment", // أو أي حقول محتاجاها من الـ Review
  }).populate("availability");

  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
