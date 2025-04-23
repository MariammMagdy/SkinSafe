// script for firebase and firebase messaging
importScripts("");

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

//retrieve fire base messaging
const messaging = firebase.messaging();

messaging.onBackgroungMessage(function (payload) {
  console.log("Received background message", payload);
});
