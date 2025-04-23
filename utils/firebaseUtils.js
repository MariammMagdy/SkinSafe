const { initializeApp } = require("firebase-admin");

const firebaseConfig = {
  apiKey: "AIzaSyDqvznsZ-O1JPBvyenWMb-V-wOCaANfQ5c",
  authDomain: "skinsafe-ebd05.firebaseapp.com",
  projectId: "skinsafe-ebd05",
  storageBucket: "skinsafe-ebd05.firebasestorage.app",
  messagingSenderId: "294121953561",
  appId: "1:294121953561:web:6a83855d48d02cbd2d8d88",
  measurementId: "G-BXQ9RZGH0S",
};

const vapKey =
  "BMHJc5B2NiPJOh7YwIJTza_gjTN8mXhgM0eWrSn74cylOM5vPECDeLsOdOzNZXlixFlP1VjAAz7nJeGiL9Jhudc";
const app = initializeApp(firebaseConfig);

const message = getMessaging(app);

export const requestFCMToken = async () => {
  return Notification.requestPermission()
    .then((permission) => {
      if (permission === "granted") {
        return getToken(messaging, { vapidKey: vapKey });
      } else {
        throw new Error("Notifications not granted");
      }
    })
    .catch((error) => {
      console.error("Error getting FCM token:", error);
      throw error;
    });
};
