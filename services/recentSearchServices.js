const asyncHandler = require("express-async-handler");
const DoctorModel = require("../models/doctorModel");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");

exports.addDoctor = asyncHandler(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const doctorId = req.body.doctorId || req.body; // لو بعت كـ JSON: { "doctorId": "..." } أو ID مباشر

    user.doctors = user.doctors.filter(
    (docId) => docId.toString() !== doctorId.toString()
  );

  user.doctors.unshift(doctorId);

  if (user.doctors.length > 3) {
    user.doctors.pop();
  }

  await user.save();

    // تأكد إن الدكتور موجود
    /*const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) {
      return next(new ApiError("Doctor not found", 404));
    }

    user.doctors.push(doctorId);

    if (user.doctors.length > 3) {
      user.doctors.shift();
    }

    await user.save();*/

    res.status(200).json({
      status: "success",
      message: "Doctor added successfully.",
      data: user.doctors,
    });
  });


exports.getMyDoctors = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const doctorIds = user.doctors; 

  const doctors = await DoctorModel.find({ _id: { $in: doctorIds } });

  const sortedDoctors = doctorIds.map((id) =>
    doctors.find((doc) => doc._id.toString() === id.toString())
  );

  res.status(200).json({
    status: "success",
    data: sortedDoctors,
  });
});































/*exports.addDoctor = asyncHandler(async (req, res, next) => {
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
});*/
 