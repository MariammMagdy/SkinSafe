const express = require("express");
const {
  sendFirebaseNotification,
  sendMultipleFirebaseNotification,
} = require("../controllers/firebaseController");

const router = express.Router();
router.post("/send-notification", async (req, res) => {
  const result = await sendFirebaseNotification(req, res);
  return res.send(result);
});

router.post("/send-multiple-notification", async (req, res) => {
  const results = await sendMultipleFirebaseNotification(req, res);
  return res.send(results);
});
module.exports = router;
