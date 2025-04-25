const admin = require("firebase-admin");

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
    token: fdsfdsfdns,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("تم إرسال الرسالة بنجاح:", response);
  } catch (error) {
    console.error("حدث خطأ أثناء إرسال الرسالة:", error);
  }
};
