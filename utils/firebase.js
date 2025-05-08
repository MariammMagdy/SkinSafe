const axios = require("axios");

// Send push notification to a device via FCM
exports.sendPushNotification = async (deviceToken, { title, message }) => {
  const serverKey = process.env.FCM_SERVER_KEY; // نحطه في env file
  const url = "https://fcm.googleapis.com/fcm/send";

  const payload = {
    to: deviceToken,
    notification: {
      title,
      body: message,
      sound: "default",
    },
    priority: "high",
  };

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `key=${serverKey}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Push notification sent successfully ✅");
  } catch (error) {
    console.error(
      "Failed to send push notification ❌",
      error.response?.data || error.message
    );
  }
};
