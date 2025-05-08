const asyncHandler = require("express-async-handler");
 
exports.addDoctor = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
 
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
 
  // adds the new location to the array
  user.doctors.push(req.body);
 
  // verifies that the array doesn't contain more than 3 elements
  if (user.doctors.length > 3) {
    user.doctors.shift(); // removes the first element (older)
  }
 
  // saves updates
  await user.save();
 
  res.status(200).json({
    status: "success",
    message: "doctor added successfully.",
    data: user.doctors,
  });
});
 
// Get all doctors for a user
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate({
    path: "doctors",
    select: "ratingsAverage specialty secondName firstName",
  });
 
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
 
  res.status(200).json({
    status: "success",
    data: user.doctors,
  });
});
 