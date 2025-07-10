const express = require("express");
const router = express.Router();
const Notification = require("../models/notificationModel");
const { sendPushNotification } = require("../utils/firebase");

// ✅ إنشاء إشعار جديد + إرسال Push Notification
router.post("/", async (req, res) => {
  try {
    const { title, message, iconType, userId, deviceToken } = req.body;

    // حفظ الإشعار في قاعدة البيانات
    const notification = await Notification.create({
      title,
      message,
      iconType,
      userId,
    });

    // إرسال إشعار Push (اختياري حسب وجود التوكن)
    if (deviceToken) {
      await sendPushNotification(deviceToken, {
        title,
        message,
      });
    }

    res.status(201).json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ جلب كل الإشعارات أو حسب userId (اختياري)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ حذف إشعار حسب ID
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/* const express = require("express");
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

/*
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
 */
