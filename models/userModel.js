const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
      /*validate: {
       validator: function (value) {
        return new Date() - value > 31557600000; // 31557600000 milliseconds = 1 year
      },
      message: "Date of birth must be before today's date",
    }, */
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    skinTone: {
      type: String,
      required: true,
      enum: ["Light", "Light to Medium", "Medium", "Medium to dark", "Dark"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9]+$/,
      message: "Username must only contain alphanumeric characters",
      lowercase: true,
      trim: true,
      /*  validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }, */
    },
    email: {
      type: String,
      required: true,
      unique: true,
      /* validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Please enter a valid email address",
    }, */
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "default_profile_image.jpg",
    },
    doctors: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        name: {
          type: String,
        },
        speciality: {
          type: String,
        },
        rating: {
          type: Number,
          required: true,
          min: 0,
          max: 5
        },
        scheduleLink: {
          type: String,
          required: true
        },
        profileImage: {
          type: String, // Store image URL or path
          required: false
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
