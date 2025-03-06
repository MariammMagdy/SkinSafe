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

// const setImageURL = (doc) => {
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URI}/articles/${doc.image}`;
//     doc.image = imageUrl;
//   }
// };
// // findOne, findAll and update
// ArticleSchema.post("init", (doc) => {
//   setImageURL(doc);
// });

// // create
// ArticleSchema.post("save", (doc) => {
//   setImageURL(doc);
// });

module.exports = mongoose.model("Article", ArticleSchema);
