const path = require("path");
const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
//const ApiError = require("../utils/ApiError");
const reportModel = require("../models/reportModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only .jpeg/.jpg/.png files allowed"));
  },
});

exports.uploadReportImage = upload.single("scannedImage");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
    const cloudinaryResult = await cloudinary.uploader.upload(base64Image, {
      folder: "reports/new",
      transformation: {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto",
        format: "auto",
        quality: "auto",
      },
    });

    req.body.scannedImage = cloudinaryResult.secure_url;

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype,
    });

    const aiResponse = await axios.post(
      "https://skin-safe-production.up.railway.app/predict",
      form,
      {
        headers: {
          "x-api-key": process.env.API_KEY,
          ...form.getHeaders(),
        },
      }
    );

    req.body.typeDetected = aiResponse.data.label;
    req.body.confidence = aiResponse.data.confidence;
    req.aiResult = aiResponse.data;

    next();
  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to process image",
      error: err.response?.data || err.message,
    });
  }
});

// =======================
// Create a new report
// =======================
exports.createReport = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  const report = await reportModel.create(req.body);

  res.status(201).json({
    data: report,
    aiResult: req.aiResult || null,
  });
});

// =======================
// Get all reports for a specific user
// =======================

exports.getAllReports = asyncHandler(async (req, res) => {
  const reports = await reportModel.find({ user: req.params.id });
  res.status(200).json(reports);
});
// =======================
// Get a single report by ID
// =======================*/

exports.getReportById = asyncHandler(async (req, res) => {
  const report = await reportModel.findById(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.status(200).json(report);
});

// =======================
// Delete a report by ID
// =======================
exports.deleteReport = asyncHandler(async (req, res) => {
  const report = await reportModel.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.status(200).json({ message: "Report deleted" });
});
