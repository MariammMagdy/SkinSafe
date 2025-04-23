/*
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
*/
const admin = require("../utils/firebase");
class NotificationService {
  static async sendNotification(deviceToken, title, body) {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
    };
    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (err) {
      throw err;
    }
  }

  static async sendMultipleNotification(deviceTokens, title, body) {
    const messages = deviceTokens.map((token) => ({
      notification: {
        title,
        body,
      },
      token: token,
    }));

    try {
      const response = await admin.messaging().sendMulticast(messages);
      return response;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = NotificationService;
