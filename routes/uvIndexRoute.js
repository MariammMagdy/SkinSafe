const express = require("express");

const { UV } = require("../services/uvIndexServices");

const router = express.Router();

// 📤 Get latest UV Index
router.get("/latest-uv", UV);

module.exports = router;












/*router.post("/", createUVIndexFromAPI);

router
    .route("/latest-uv")
    .get(getLatestUVIndex); // Get the latest UV Index

router
    .route("/update-uv")
    .post(createUVIndexValidator, validatorMiddleware, createUVIndexFromAPI); // Update UV Index

module.exports = router;*/
