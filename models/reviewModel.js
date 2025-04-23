const mongoose = require("mongoose");
const Doctor = require("./doctorModel");

const reviewSchema = mongoose.Schema(
  {
    title: String,
    ratings: {
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
        avgRating: { $avg: "$ratings" },
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

/*
// models/reviewModel.js
const mongoose = require("mongoose");
const Doctor = require("./doctorModel");
const User = require("./userModel");

const reviewSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // لضمان أن المستخدم يكتب تقييمًا واحدًا فقط
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

// Populate user name when finding reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

// Static method to calculate average ratings and quantity
reviewSchema.statics.calcAverageRatingAndQuantity = async function (doctorId) {
  const result = await this.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: "doctor",
        avgRating: { $avg: "$ratings" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsAverage: result[0].avgRating,
      ratingsQuantity: result[0].ratingQuantity,
    });
  } else {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

// Trigger calc after save
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingAndQuantity(this.doctor);
});

// Trigger calc after findOneAndDelete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingAndQuantity(doc.doctor);
  }
});

// Trigger calc after findOneAndUpdate if rating changed
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingAndQuantity(doc.doctor);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
*/
