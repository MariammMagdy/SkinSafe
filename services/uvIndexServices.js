const axios = require("axios");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const slugify = require("slugify");
const UVIndex = require("../models/uvIndexModel");
require("dotenv").config();

// 🧠 Get risk level based on UV value
const getRiskLevel = (uv) => {
    if (uv < 3) return "Low";
    else if (uv < 6) return "Moderate";
    else if (uv < 8) return "High";
    else if (uv < 11) return "Very High";
    else return "Extreme";
};

// 📥 Create UV Index from OpenWeather API (for scheduler usage)
const createUVIndexFromAPIInternal = async (lat, lon, locationName) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

    const response = await axios.get(url, { timeout: 5000 });
    const uvValue = response.data.value;
    const riskLevel = getRiskLevel(uvValue);

    await UVIndex.findOneAndUpdate(
        { locationName: locationName },
        {
            locationName,
            lat,
            lon,
            uvValue,
            riskLevel,
        },
        { upsert: true, new: true }
    );
};

// 📥 Create UV Index from OpenWeather API (for API request)
exports.createUVIndexFromAPI = asyncHandler(async (req, res, next) => {
    const { lat, lon, locationName } = req.body;
    try {
        await createUVIndexFromAPIInternal(lat, lon, locationName);
        res.status(200).json({
            success: true,
            message: "UV Index updated successfully ✅",
        });
    } catch (error) {
        console.error("Error fetching UV Index from API:", error.message);
        return next(new ApiError("Failed to fetch UV Index data", 500));
    }
});

// 📤 Get Latest UV Index
exports.getLatestUVIndex = asyncHandler(async (req, res, next) => {
    const latestUV = await UVIndex.findOne().sort({ createdAt: -1 });
    if (!latestUV) {
        return next(new ApiError("No UV Index data available", 404));
    }

    res.status(200).json({
        success: true,
        data: latestUV,
    });
});

exports.createUVIndexFromAPIInternal = createUVIndexFromAPIInternal;


