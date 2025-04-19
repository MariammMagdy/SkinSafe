const path = require("path");
const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
//const ApiError = require("../utils/ApiError");
const reportModel = require("../models/reportModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

// =======================
// Multer Config
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

exports.uploadReportImage = upload.single("scannedImage");

// =======================
// Resize + Upload to Cloudinary
// =======================
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const transformationOption = {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      format: "auto",
      quality: "auto",
    };

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "reports/new",
      transformation: transformationOption,
    });

    // ✅ تم التعديل هنا
    req.body.scannedImage = result.secure_url;
  }
  next();
});

// =======================
// Create a new report
// =======================
exports.createReport = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.typeDetected);
  const report = await reportModel.create(req.body);
  res.status(201).json({ data: report });
});

// =======================
// Get all reports for a specific user
// =======================

exports.getAllReports = asyncHandler(async (req, res) => {
  const reports = await reportModel.find();
  res.status(200).json(reports);
});

// =======================
// Get a single report by ID
// =======================

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
