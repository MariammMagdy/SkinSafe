const NotificationService = require("../services/notificationServices");

const sendFirebaseNotification = async (req, res) => {
  try {
    const { title, body, deviceToken } = req.body;
    await NotificationService.sendNotification(deviceToken, title, body);
    res
      .status(200)
      .json({ message: "Notification send succesfully", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending notification", success: false });
  }
};

const sendMultipleFirebaseNotification = async (req, res) => {
  try {
    const { title, body, deviceTokens } = req.body;
    await NotificationService.sendMultipleNotification(
      deviceTokens,
      title,
      body
    );
    res
      .status(200)
      .json({ message: "Notifications send succesfully", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending notification", success: false });
  }
};

async function sendEveryMinuteNotification() {
  const title = "Every Minute Notification";
  const body = "Hello from body";
  const deviceToken =
    "BMHJc5B2NiPJOh7YwIJTza_gjTN8mXhgM0eWrSn74cylOM5vPECDeLsOdOzNZXlixFlP1VjAAz7nJeGiL9Jhudc";
  await NotificationService.sendNotification(deviceToken, title, body);
}
module.exports = {
  sendFirebaseNotification,
  sendMultipleFirebaseNotification,
  sendEveryMinuteNotification,
};
