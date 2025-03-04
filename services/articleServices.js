const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");
const articleModel = require("../models/articleModel");
const { uploadSingleImage } = require("../middleware/uploadImageMilddleware");

// Upload single image
exports.uploadArticleImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  //image processing to best preofrmance (buffer need memory storage not disckstorage)
  const filename = `article-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer) //sharp library image processing for nodejs   sharp is a promise need a awit
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 }) //to decreae size
    .toFile(`uploads/articles/${filename}`);

  // Save image into our db
  req.body.image = filename;

  next();
});

exports.createArticle = asyncHandler(async (req, res) => {
  const newArticle = await articleModel.create(req.body);
  res.status(201).send(newArticle);
});

exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await articleModel.find();
  res.send(articles);
});

exports.getArticleById = asyncHandler(async (req, res) => {
  const article = await articleModel.findById(req.params.id);
  if (!article) return res.status(404).send("Article not found");
  res.send(article);
});

exports.updateArticle = asyncHandler(async (req, res) => {
  const article = await articleModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!article) return res.status(404).send("Article not found");
  res.send(article);
});

exports.deleteArticle = asyncHandler(async (req, res) => {
  const article = await articleModel.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).send("Article not found");
  res.send("Article deleted");
});
