const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cron = require("node-cron");
const compression = require("compression");
dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/database");
const mountRoutes = require("./routes/index");

// Routes
const articleRoute = require("./routes/articleRoute");
const reviewRoute = require("./routes/reviewRoute");
const reportRoute = require("./routes/reportRoute");
const doctorRoute = require("./routes/doctorRoute");
const recentSearchRoute = require("./routes/recentSearchRoutes");
const firebaseRoute = require("./routes/firebaseRoute");
const notificationRoute = require("./routes/notificationRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const doctorAvailabilityRoute = require("./routes/doctorAvailabilityRoute");
const appointmentRoute = require("./routes/appointmentRoute");
const uvIndexRoute = require("./routes/uvIndexRoute");

const {
  sendEveryMinuteNotification,
} = require("./controllers/firebaseController");

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

/*
cron.schedule("* * * * * ", async () => {
  console.log("sending every minute");
  await sendEveryMinuteNotification();
});
*/

// compress all responses
app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

const Verification = require("./models/codeModel");
const deleteExpiredVerifications = async () => {
  const now = new Date();

  try {
    // Find all expired records
    const expiredVerifications = await Verification.find({
      expiresAt: { $lt: now },
    });

    // Delete all expired records
    await Verification.deleteMany({
      _id: { $in: expiredVerifications.map((v) => v._id) },
    });

    console.log(
      `${expiredVerifications.length} expired verifications deleted.`
    );
  } catch (err) {
    console.error("Error deleting expired verifications:", err);
  }
};

// Call the function
deleteExpiredVerifications();

//Mount Routes
mountRoutes(app);
app.use("/api/v1/articles", articleRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/reports", reportRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/recentSearch",recentSearchRoute);
app.use("/api/v1/firebase", firebaseRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/availability", doctorAvailabilityRoute);
app.use("/api/v1/appointments", appointmentRoute);
//app.use("/api/v1/doctors/:doctorId/reviews", reviewRoute);
app.use("/api/v1/uvIndex", uvIndexRoute);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
app.use(globalError);

const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});

//console.log('KEY:', process.env.OPENWEATHER_API_KEY);
console.log('KEY:', process.env.OPENWEATHER_API_KEY);
console.log('KEY:', process.env.OPENWEATHER_API_KEY);
console.log('KEY:', process.env.OPENWEATHER_API_KEY);
