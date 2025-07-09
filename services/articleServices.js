const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const articleModel = require("../models/articleModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const path = require("path");

const fs = require("fs");

// قبل multer
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
 /* const tempDir = path.join("/tmp", "uploads");
  if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}*/

  //fs.mkdirSync(uploadDir);
}

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

exports.uploadArticleImage = upload.single("image");

// =======================
// Resize + Upload to Cloudinary
// =======================
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const tranformationOption = {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      format: "auto",
      quality: "auto",
    };

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Articles/new",
      transformation: tranformationOption,
    });

    req.body.image = result.secure_url;
  }
  next();
});

// =======================
// Create Article
// =======================
exports.createArticle = asyncHandler(async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res
        .status(400)
        .json({ error: "Title and content are required fields" });
    }

    const newArticle = await articleModel.create({
      title,
      content,
      image: req.body.image || null,
    });

    res
      .status(201)
      .json({ message: "Article created successfully", newArticle });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// =======================
// Get All Articles
// =======================
exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await articleModel.find();
  res.status(200).json(articles);
});

// =======================
// Get Article by ID
// =======================
exports.getArticleById = asyncHandler(async (req, res) => {
  const article = await articleModel.findById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.status(200).json(article);
});

// =======================
// Update Article
// =======================
exports.updateArticle = asyncHandler(async (req, res) => {
  const article = await articleModel.findByIdAndUpdate(
    req.params.id,
    req.body,

    {
      new: true,
    }
  );
  //console.log("Request Body ===>", req.body);

  if (!article) return res.status(404).json({ error: "Article not found" });
  res.status(200).json({ message: "Article updated", article });
});

// =======================
// Delete Article
// =======================
exports.deleteArticle = asyncHandler(async (req, res) => {
  const article = await articleModel.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.status(200).json({ message: "Article deleted" });
});
