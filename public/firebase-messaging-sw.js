importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDqvznsZ-O1JPBvyenWMb-V-wOCaANfQ5c",
  authDomain: "skinsafe-ebd05.firebaseapp.com",
  projectId: "skinsafe-ebd05",
  storageBucket: "skinsafe-ebd05.firebasestorage.app",
  messagingSenderId: "294121953561",
  appId: "1:294121953561:web:6a83855d48d02cbd2d8d88",
  measurementId: "G-BXQ9RZGH0S",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ التصحيح هنا
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png", // غيره حسب شعار التطبيق
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
