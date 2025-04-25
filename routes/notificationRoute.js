const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationServices");

// إضافة إشعار جديد
router.post("/", async (req, res) => {
  try {
    const notification = await notificationService.sendNotification(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب كل الإشعارات
router.get("/", async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications();
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
