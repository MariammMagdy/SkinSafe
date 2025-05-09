const asyncHandler = require("express-async-handler");
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  res.status(400).json({
    // more detils for error
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorForProd = (err, res) => {
  res.status(400).json({
    // more detils for error
    status: err.status,
    message: err.message,
  });
};
const createUser = asyncHandler(async (req, res, next) => {
  // تعديل الفورمات قبل حفظ الداتا
  if (req.body.dateOfBirth) {
    const [day, month, year] = req.body.dateOfBirth.split("-");
    req.body.dateOfBirth = new Date(`${year}-${month}-${day}`);
  }

  const user = await User.create(req.body);

  res.status(201).json({ data: user });
});

module.exports = globalError;
