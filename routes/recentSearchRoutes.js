const express = require('express');
const { addDoctor, getDoctors } = require('../services/recentSearchServices');

const router = express.Router();

router.post('/addDoctor', addDoctor);
router.get('/getDoctors', getDoctors);

module.exports = router;