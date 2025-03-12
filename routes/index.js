const authRoute = require("./authRoute");
const userRoute = require("./userRoute");

// Make sure your routes come after the session middleware

const mountRoutes = (app) => {
  app.use("/auth", authRoute);
  app.use("/users", userRoute);
};

module.exports = mountRoutes;
