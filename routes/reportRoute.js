const express = require('express');
const {
    createReportValidator,
    getReportValidator,
    deleteReportValidator
} = require("../utils/validator/articleValidator");

const {
    createReport,
    getAllReports,
    getReportById,
    deleteReport
} = require("../services/areportServices");

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getAllReports)
    .post(createReportValidator, createReport);

router
    .route('/:id')
    .get(getReportValidator, getReportById)
    .delete(deleteReportValidator, deleteReport);

module.exports = router;
