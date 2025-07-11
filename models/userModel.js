const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
      match: [
        /^\d{2}-\d{2}-\d{4}$/,
        "Date of birth must be in DD-MM-YYYY format",
      ],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"],
    },
    skinTone: {
      type: String,
      enum: ["light", "light to medium", "medium", "medium to dark", "dark"], // You can adjust values based on your options
      required: [true, "Skin tone is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "doctor", "admin"],
      default: "user",
      select: false, // لو فيه هذا السطر لازم تعمل .select("+role")
    },
    fcmToken: {
      type: [String],
      default: [],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    doctors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Doctor",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
