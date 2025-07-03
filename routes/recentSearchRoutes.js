const express = require('express');
const { addDoctor, getMyDoctors } = require('../services/recentSearchServices');

const authServer = require("../services/authServices");

const router = express.Router();
router.use(authServer.protect, authServer.allowedTo("user"));

router.post('/addDoctor', addDoctor);
router.get('/getMyDoctors', getMyDoctors);

module.exports = router;