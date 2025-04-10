const Notification = require("../models/notificationModel");

// إضافة إشعار جديد
async function createNotification(data) {
  const notification = new Notification(data);
  return await notification.save();
}

// جلب كل الإشعارات مرتبة من الأحدث للأقدم
async function getAllNotifications() {
  return await Notification.find().sort({ createdAt: -1 });
}

// حذف إشعار (اختياري)
async function deleteNotification(id) {
  return await Notification.findByIdAndDelete(id);
}

module.exports = {
  createNotification,
  getAllNotifications,
  deleteNotification,
};
