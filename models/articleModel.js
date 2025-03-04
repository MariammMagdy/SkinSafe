const mongoose = require("mongoose");

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
