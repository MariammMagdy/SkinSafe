const mongoose = require("mongoose");
const Doctor = require("./doctorModel");
const User = require("./userModel");

const reviewSchema = mongoose.Schema(
  {
    title: String,
    rating: {
      type: Number,
      min: [1, "minmum no is 1.0"],
      max: [5, "maxmum no is 5.0"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRatingAndQuantity = async function (doctorId) {
  const result = await this.aggregate([
    //stage 1:kol el reviews of the specific product
    { $match: { doctor: doctorId } },
    {
      //stage 2: calculate average and total ratings(grouping)
      $group: {
        _id: "doctor",
        avgRating: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);

  //console.log(result);
  if (result.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsAverage: result[0].avgRating,
      ratingsQuantity: result[0].ratingQuantity,
    });
  } else {
    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: 0,
      ratingQuantity: 0,
    });
  }
};
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.doctor);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.doctor);
});

module.exports = mongoose.model("Review", reviewSchema);
