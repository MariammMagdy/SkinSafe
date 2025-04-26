const cron = require("node-cron");
const { fetchAndSaveUVIndex } = require("../services/uvIndexServices");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("express-async-handler");  

// هنا ثبتي location اللى عايزة تعمليله UV index
const lat = 30.0444; // Latitude بتاع القاهرة مثلاً
const lon = 31.2357; // Longitude بتاع القاهرة
const locationName = "Cairo"; // اسم المكان

const scheduleUVIndexUpdate = () => {
    cron.schedule("*/30 * * * *", async () => {
        console.log("Fetching latest UV Index from API...");
        try {
            await fetchAndSaveUVIndex(lat, lon, locationName);
            console.log("UV Index updated successfully ✅");
        } catch (error) {
            console.error(`Failed to update UV Index ❌: ${error.message}`);
        }
    });
};

module.exports = scheduleUVIndexUpdate;



// ✨ Scheduler task to run every 30 minutes
//scheduleUVIndexUpdate = asyncHandler(() => {  
//    cron.schedule("*/30 * * * *", async (req, res, next) => { 
//        console.log("Fetching latest UV Index from API...");
//        try {
//            await createUVIndexFromAPI(lat, lon, locationName);
//            console.log("UV Index updated successfully ✅");
//        } catch (error) {
//            return next(new ApiError(`Failed to update UV Index ❌: ${error.message}`, 500)); // استخدام ApiError مع next
//        }
//    });
//});

//module.exports = scheduleUVIndexUpdate;
