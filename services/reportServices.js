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

// ===================
// Generate Comment via OpenRouter AI
// ===================
const generateComment = async (label, confidence) => {
    const prompt = `
You are a medical assistant specialized in dermatology.

Based on the following AI diagnosis, generate a short and realistic advice (1–2 sentences max) in **English**, telling the user what to do next:

Disease type: ${label}
Confidence level: ${confidence}

The tone should be calm, informative, and helpful. If the condition is severe, advise them to visit a doctor. Otherwise, explain what actions to take or signs to watch for.
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};

// ===================
// Resize + Predict + Generate Comment
// ===================
exports.resizeImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // رفع الصورة لـ Cloudinary
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

    // استدعاء AI لعمل التنبؤ
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

    const { label, confidence } = aiResponse.data;
    req.body.typeDetected = label;
    req.body.confidence = confidence;

    // 🔁 استدعاء OpenRouter
    const prompt = `You are a dermatologist assistant. Based on the diagnosis "${label}" with a confidence of ${confidence}, provide a single, concise but informative sentence (around 2 lines) in English giving advice to the patient. Avoid repetition and don't mention confidence again.`;
    const gptResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const comment = gptResponse.data.choices[0].message.content;
    req.body.comment = comment;

    req.aiResult = {
      ...aiResponse.data,
      comment,
    };

    next();
  } catch (err) {
    res.status(500).json({
      message: "Failed to process image",
      error: err.response?.data || err.message,
    });
  }
});

// ===================
// Create Report
// ===================
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
  const reports = await reportModel.find({ user: req.params.id }).populate({
    path: 'user',
    select: 'name phoneNumber skinTone gender'
  });
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