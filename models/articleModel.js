const mongoose = require("mongoose");
// 1- Create Schema
const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    content: String,
    author: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
