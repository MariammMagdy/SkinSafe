const express = require('express');
const {
    createReportValidator,
    getReportValidator,
    deleteReportValidator
} = require("../utils/validator/reportValidator");

const {
    createReport,
    getAllReports,
    getReportById,
    deleteReport,
    uploadReportImage,
    resizeImage,
} = require("../services/reportServices");

const router = express.Router();

router
    .route('/')
    .post(createReportValidator, uploadReportImage, resizeImage, createReport)
    .get(getAllReports);
    
router
    .route('/:id')
    .get(getReportValidator, getReportById)
    .delete(deleteReportValidator, deleteReport);

module.exports = router;
