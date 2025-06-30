const mongoose = require("mongoose");
const Doctor = require("./doctorModel");

const reviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "review ratings required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // parent reference (one to many)
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "Review must belong to doctor"],
    },
  },
  { timestamps: true }
);
reviewSchema.index({ doctor: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});
// i do  any review this method call and calc avg and quantity in this doctor
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (doctorId) {
  const result = await this.aggregate([
    // Step 1: Get all reviews for the specified doctor
    {
      $match: { doctor: doctorId },
    },
    // Step 2: Group by doctor ID and calculate average rating and count
    {
      $group: {
        _id: "$doctor",
        avgRatings: { $avg: "$rating" }, // ✅ التصحيح هنا
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  console.log("Aggregation result: ", result); // 👈 شوف ده بيطبع إيه

  if (result.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

//call this when i update  ex review in services

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.doctor);
});
//call this when i delete  ex review in services
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.doctor);
});
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatingsAndQuantity(doc.doctor);
});

module.exports = mongoose.model("Review", reviewSchema);
