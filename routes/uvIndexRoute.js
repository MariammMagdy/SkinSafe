const express = require("express");
const {
    createUVIndexValidator,
} = require("../utils/validator/uvIndexValidator");

const {
    createUVIndexFromAPI,
    getLatestUVIndex,
} = require("../services/uvIndexServices");

const validatorMiddleware = require("../middleware/validatorMiddleware");

const router = express.Router();

router
    .route("/latest-uv")
    .get(getLatestUVIndex); // Get the latest UV Index

router
    .route("/update-uv")
    .post(createUVIndexValidator, validatorMiddleware, createUVIndexFromAPI); // Update UV Index

module.exports = router;
