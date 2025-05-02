const path = require("path");
const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const DoctorAvailability = require("../models/doctorAvailability");
const doctorModel = require("../models/doctorModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

// =======================
// Multer Config
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg formats are allowed!"));
    }
  },
});

exports.uploadDoctorImage = upload.single("doctorImage");

// =======================
// Resize + Upload to Cloudinary
// =======================
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const transformationOption = {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      format: "auto",
      quality: "auto",
    };

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "doctors/new",
      transformation: transformationOption,
    });

    req.body.doctorImage = result.secure_url;
  }
  next();
});

// =======================
// Create Doctor
// =======================
exports.createDoctor = asyncHandler(async (req, res) => {
  req.body.slug = slugify(`${req.body.firstName}-${req.body.secondName}`, {
    lower: true,
  });
  const doctor = await doctorModel.create(req.body);
  res.status(201).json({ data: doctor });
});

// =======================
// Get All Doctors
// =======================
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorModel.find().sort({ ratingAverage: -1 });
  res.status(200).json({ data: doctors });
});

// =======================
// Get Doctor By ID
// =======================
exports.getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new ApiError(`No Doctor for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: doctor });
});

// =======================
// Update Doctor
// =======================
exports.updateDoctor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = {};

  if (req.body.experience) updates.experience = req.body.experience;
  if (req.body.about) updates.about = req.body.about;
  if (req.body.image) updates.image = req.body.image;
  if (req.body.certificate) updates.certificate = req.body.certificate;
  if (req.body.doctorImage) updates.doctorImage = req.body.doctorImage;

  const doctor = await doctorModel.findById(id);
  if (!doctor) {
    return next(new ApiError(`No doctor found for this id ${id}`, 404));
  }

  // ✅ Update availability if provided
  if (req.body.availability) {
    const sluggedAvailability = req.body.availability.map((entry) => ({
      ...entry,
      slug: slugify(entry.day, { lower: true }),
    }));

    await DoctorAvailability.findOneAndUpdate(
      { doctor: id },
      { availability: sluggedAvailability },
      { new: true, runValidators: true, upsert: true }
    );
  }

  Object.assign(doctor, updates);
  await doctor.save();

  res.status(200).json({ data: doctor });
});

// =======================
// Delete Doctor
// =======================
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await doctorModel.findByIdAndDelete(req.params.id);
  if (!doctor) {
    return next(
      new ApiError(`No Doctor found for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ message: "Doctor is deleted" });
});

/*
const slugify = require("slugify");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");
const doctorModel = require("../models/doctorModel");
const cloudinary = require("../utils/cloudinary");
const { uploadSingleImage } = require("../middleware/uploadImageMilddleware");

// Upload single image
exports.uploadDoctorImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    //image processing to best preofrmance (buffer need memory storage not disckstorage)
    if(req.file){
        const tranformationOption ={
            width :500,
            height: 500,
            crop: "fill",
            gravity:"auto",
            format :"auto",
            quality:"auto",
        }
        const result = await cloudinary.uploader.upload(req.file.path,{
            folder:"doctors/new",
            transformation:tranformationOption
        })
        req.body.scannedImage = result.secure_url;
    }

    // Save image into our db

    next();
});

// Create a new doctor
exports.createDoctor = asyncHandler(async function (req, res) {
    req.body.slug = slugify(req.body.firstName);
    req.body.slug = slugify(req.body.secondName);
    const doctor = await doctorModel.create(req.body);
    res.status(201).json(doctor);
});

// Get All Doctors
exports.getAllDoctors = asyncHandler(async function (req, res) {
    const doctors = await doctorModel.find().sort({ ratingAverage: -1 });
    res.status(200).json({data: doctors});
});

// Get a specific Doctor By ID
exports.getDoctorById = asyncHandler(async function (req, res, next) {
    const { id } = req.params;
    const doctor = await doctorModel.findById(id);
    if (!doctor){
        return next(new apiError('No Doctor for this id ${id}', 404));
    } 
    res.status(200).json({ data: doctor });
});

// Update Doctor for a specific id (Only updates experience, about, image, and certificate)
exports.updateDoctor = asyncHandler(async function (req, res, next) {
    const { id } = req.params;
    const updates = {};
    
    if (req.body.experience) updates.experience = req.body.experience;
    if (req.body.about) updates.about = req.body.about;
    if (req.body.image) updates.image = req.body.image;
    if (req.body.certificate) updates.certificate = req.body.certificate;
    if (day) {
        day.forEach((newDay) => {
            const existingDay = doctorModel.day.find((d) => d.type === newDay.type);
            if (existingDay) {
                existingDay.slots = newDay.slots;
            } else {
                doctorModel.day.push(newDay);
            }
        });
    }
    
    const doctor = await doctorModel.findByIdAndUpdate(id, updates, { new: true });
    if (!doctor) {
        return next(new ApiError('No doctor found for this id ${id}', 404));
    }
    res.status(200).json({data: doctor});
});

// Delete Doctor
exports.deleteDoctor = asyncHandler(async function (req, res, next) {
    const { id } = req.params;
    const doctor = await doctorModel.findByIdAndDelete(id);
    if (!doctor) {
        return next(new apiError('No Doctor found for this id ${id}', 404));
    }
    res.status(204).send();
});
*/
