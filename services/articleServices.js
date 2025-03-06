const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");
const articleModel = require("../models/articleModel");
const cloudinary = require("../utils/cloudinary");
const { uploadSingleImage } = require("../middleware/uploadImageMilddleware");

// Upload single image
exports.uploadArticleImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  //image processing to best preofrmance (buffer need memory storage not disckstorage)
 if(req.file){
  const tranformationOption ={
    width :500,
    height: 500,
    crop: "fill",
    gravity:"auto",
    format :"auto",
    quality:"auto",
  }
  const result = await cloudinary.uploader.upload(req.file.path,{
    folder:"Articels/new",
    transformation:tranformationOption
  })
  req.body.image = result.secure_url;
 }

  // Save image into our db

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
