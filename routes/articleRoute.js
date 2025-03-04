const express = require("express");
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
  .get(getAllArticles)
  .post(uploadArticleImage, resizeImage, createArticleValidator, createArticle);
router
  .route("/:id")
  .get(getArticleValidator, getArticleById)
  .put(uploadArticleImage, resizeImage, updateArticleValidator, updateArticle)
  .delete(deleteArticleValidator, deleteArticle);

module.exports = router;
