// utils/firebase.js

const admin = require("firebase-admin");

const serviceAccount = require("../skinsafe-ebd05-firebase-adminsdk-fbsvc-b3c2e1939b.json"); // ملف JSON من Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
