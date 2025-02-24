const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');
const articleModel = require('../models/articleModel');

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
    if (!article) return res.status(404).send('Article not found');
    res.send(article);
});

exports.updateArticle = asyncHandler(async (req, res) => {
    const article = await articleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).send('Article not found');
    res.send(article);
});

exports.deleteArticle = asyncHandler(async (req, res) => {
    const article = await articleModel.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).send('Article not found');
    res.send('Article deleted');
});