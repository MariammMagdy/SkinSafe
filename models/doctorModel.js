const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    specialization: {
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
    department: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      /* validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: "Rating average must be an integer value."
    } */
    },
    about: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
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
      default: "default_profile_image.jpg",

      /*
    validate: {
       validator: function(v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: "Image must be a valid image file (jpg, jpeg, png, or gif)."
    }, */
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", userSchema);
