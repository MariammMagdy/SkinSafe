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
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
          max: 5,
        },
        scheduleLink: {
          type: String,
          required: true,
        },
        profileImage: {
          type: String, // Store image URL or path
          required: false,
        },
      },
    ],
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "doctor"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
