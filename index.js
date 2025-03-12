const express = require("express");
const dotenv = require("dotenv");
const ApiError = require("./utils/apiError");
dotenv.config({ path: "config.env" });
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const mountRoutes = require("./routes/index");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/database");
// Routes
const articleRoute = require("./routes/articleRoute");

const path = require("path");

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

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
//Mount Routes

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

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
