const mongoose = require("mongoose");
const Doctor = require("./doctorModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
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

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});
// i do  any review this method call and calc avg and quantity in this doctor
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (doctorId) {
  const result = await this.aggregate([
    // Stage 1 : get all reviews in specific product
    {
      //       in review  model
      $match: { doctor: doctorId },
    },
    // Stage 2: Grouping reviews based on productID and calc avgRatings, ratingsQuantity
    {
      $group: {
        _id: "doctor",
        avgRatings: { $avg: "$ratings" }, //on review model
        ratingsQuantity: { $sum: 1 }, //1  is counter
      },
    },
  ]);

  // console.log(result);
  //result=[{_id=product,avgRatings:num ,ratingsQuantity:num}]
  if (result.length > 0) {
    //there are reviews on specific product
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

module.exports = mongoose.model("Review", reviewSchema);
