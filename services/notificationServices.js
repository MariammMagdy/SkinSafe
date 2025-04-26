const admin = require("firebase-admin");
const User = require("../models/userModel");

// استيراد ملف المفتاح الخاص بحساب Firebase (الذي قمت بتحميله)
const serviceAccount = require("../skinsafe-ebd05-firebase-adminsdk-fbsvc-b3c2e1939b.json");

// تهيئة Firebase باستخدام المفتاح
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
exports.sendNotification = async (deviceToken, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: User.fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("The message sending succefully", response);
  } catch (error) {
    console.error("There are an error in sending message", error);
  }
};
