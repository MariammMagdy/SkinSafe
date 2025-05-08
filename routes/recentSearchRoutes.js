const express = require('express');
const { addDoctor, getDoctors } = require('../services/recentSearchServices');

const authServer = require("../services/authServices");

const router = express.Router();
router.use(authServer.protect, authServer.allowedTo("user"));

router.post('/addDoctor', addDoctor);
router.get('/getDoctors', getDoctors);

module.exports = router;