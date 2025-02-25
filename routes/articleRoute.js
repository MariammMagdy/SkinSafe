const express = require('express');
const {getArticleValidator, createArticleValidator, updateArticleValidator, deleteArticleValidator } = require('../utlis/validator/articleValidator');

const {createArticle, getAllArticles, getArticleById, updateArticle, deleteArticle} = require('../services/articleServices');

const router = express.Router();
router
    .route('/')
    .get(getAllArticles)
    .post(createArticleValidator, createArticle);
router
    .route('/:id')
    .get(getArticleValidator, getArticleById)
    .put(updateArticleValidator, updateArticle)
    .delete(deleteArticleValidator, deleteArticle);

module.exports = router;