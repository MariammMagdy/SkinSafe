const express = require("express");

const {
  createReportValidator,
  getReportValidator,
  deleteReportValidator,
} = require("../utils/validator/reportValidator");

const {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  uploadReportImage,
  resizeImage,
} = require("../services/reportServices");
const authServer = require("../services/authServices");

const router = express.Router();

router.use(authServer.protect, authServer.allowedTo("user"));

router
  .route("/")
  .post(uploadReportImage, resizeImage, createReportValidator, createReport);
router.get("/user/:id", getAllReports);

router
  .route("/:id")
  .get(getReportValidator, getReportById)
  .delete(deleteReportValidator, deleteReport);

module.exports = router;
