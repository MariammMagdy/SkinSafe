const mongoose = require("mongoose");
const slugify = require("slugify");

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    availability: [
      {
        day: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        timeSlots: [
          {
            type: String,
            required: true,
            trim: true,
            // Ensure time is in HH:MM format
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"],
          },
        ],
        slug: {
          type: String,
          lowercase: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate slug for each availability day
doctorAvailabilitySchema.pre("save", function (next) {
  if (this.isModified("availability")) {
    this.availability.forEach((entry) => {
      entry.slug = slugify(entry.day, { lower: true });
    });
  }
  next();
});

module.exports = mongoose.models.DoctorAvailability || mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
