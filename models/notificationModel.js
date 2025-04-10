const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: String, //"confirmation", "cancelled", "alarm", "uv_exposure"
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
