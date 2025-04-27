const axios = require("axios");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// 🧠 Get risk level based on UV value
const getRiskLevel = (uv) => {
    if (uv < 3) return "Low";
    else if (uv < 6) return "Moderate";
    else if (uv < 8) return "High";
    else if (uv < 11) return "Very High";
    else return "Extreme";
};

exports.UV = asyncHandler(async (req, res, next) => {
    try {
        // التأكد من وجود API Key
        const appid = process.env.OPENWEATHER_API_KEY;
        if (!appid) {
            return next(new ApiError("API Key is missing", 500));
        }

        // التأكد من وجود lat و lon في الطلب
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return next(new ApiError("Latitude and Longitude are required", 400));
        }

        // طلب البيانات من OpenWeatherMap
        const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi`,
        {
        params: {
            lat,
            lon,
            appid,
        },
        }
    );

    // استخراج الـ UV Index
    const uvIndex = response.data.value;
    const riskLevel = getRiskLevel(uvIndex); // استخدام دالة getRiskLevel

    // إرجاع الاستجابة
    res.status(200).json({
        success: true,
        data: {
            uvIndex,
            riskLevel,
        },
    });
    } catch (error) {
    // معالجة الأخطاء
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || "Error fetching UV Index";
    return next(new ApiError(message, statusCode));
    }
});
