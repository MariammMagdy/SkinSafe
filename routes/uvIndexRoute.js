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

// 📥 Create new UV Index manually (POST request)
router.post("/", createUVIndexValidator, createUVIndexFromAPI);

// 📤 Get latest UV Index
router.get("/latest-uv", getLatestUVIndex);

module.exports = router;













/*router.post("/", createUVIndexFromAPI);

router
    .route("/latest-uv")
    .get(getLatestUVIndex); // Get the latest UV Index

router
    .route("/update-uv")
    .post(createUVIndexValidator, validatorMiddleware, createUVIndexFromAPI); // Update UV Index

module.exports = router;*/
