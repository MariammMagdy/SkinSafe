const express = require("express");
const parseFormData = require("../middleware/parseFormData");

const {
  getArticleValidator,
  createArticleValidator,
  updateArticleValidator,
  deleteArticleValidator,
} = require("../utils/validator/articleValidator");

const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  uploadArticleImage,
  resizeImage,
} = require("../services/articleServices");

const router = express.Router();

router
  .route("/")
  .post(uploadArticleImage, resizeImage, createArticleValidator, createArticle)
  .get(getAllArticles);

router
  .route("/:id")
  .get(getArticleValidator, getArticleById)
  .put(
    uploadArticleImage,
    resizeImage,
    parseFormData,
    updateArticleValidator,
    updateArticle
  )
  .delete(deleteArticleValidator, deleteArticle);

module.exports = router;
