const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationServices");
const factor = require("../services/handlersFactory");

const { sendPushNotification } = require("../utils/firebase"); // استيراد دالة إرسال الإشعارات

// إضافة إشعار جديد
router.post("/", async (req, res) => {
  try {
    const notification = await notificationService.sendNotification(req.body);

    // لو عايز تبعت Push Notification
    if (req.body.deviceToken) {
      // خلي الموبايل يبعته مع الريكوست
      await sendPushNotification(req.body.deviceToken, {
        title: req.body.title,
        message: req.body.message,
      });
    }

    res
      .status(201)
      .json({ message: "Notification sent successfully", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  console.log(req.body);
});
// إضافة إشعار جديد
/*router.post("/", async (req, res) => {
  try {
    const notification = await notificationService.sendNotification(req.body);
    res
      .status(201)
      .json({ message: "Notification sent successfully", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  console.log(req.body);
});
*/

// جلب كل الإشعارات
router.get("/", async (req, res) => {
  try {
    const notifications = await factor.getAll();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف إشعار (اختياري)
router.delete("/:id", async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
