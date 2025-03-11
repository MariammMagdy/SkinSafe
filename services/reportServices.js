const slugify = require('slugify');
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const reportModel = require('../models/reportModel');
const cloudinary = require("../utils/cloudinary");
const { uploadSingleImage } = require("../middleware/uploadImageMilddleware");

// Upload single image
exports.uploadReportImage = uploadSingleImage("image");

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
            folder:"reports/scannedskin",
            transformation:tranformationOption
        })
        req.body.scannedImage = result.secure_url;
    }

    // Save image into our db

    next();
});

// Create a new report
exports.createReport = asyncHandler(async (req, res) => {
    req.body.slug = slugify(req.body.typeDetected);
    const report = await reportModel.create(req.body);
    res.status(201).json({ data: report });
});

// Get all reports for a specific user with pagination
exports.getAllReports = asyncHandler(async (req, res) => {
    const reports = await reportModel.find({ user: req.user.id })
        .select('createdAt updatedAt');
    res.status(200).json({ data: reports});
});

// Get a single report by ID with user details
exports.getReportById = asyncHandler(async (req, res, next) => {
    const report = await reportModel.findById(req.params.id)
        .populate({
            path: 'user',
            select: 'name email phone skinTone gender -_id'
        })
        .select('createdAt updatedAt');                 
    
    if (!report) {          
        return next(new ApiError('No report for this id', 404));
    }

    const formattedReport = {
        ...report.toObject(),
        createdAt: report.createdAt.toLocaleDateString('en-GB'),
        updatedAt: report.updatedAt.toLocaleDateString('en-GB')
    };

    res.status(200).json(formattedReport);
});

// Delete a report by ID
exports.deleteReport = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const report = await reportModel.findByIdAndDelete(id);
    if (!report) {
        return next (new ApiError('No report found for this id ${id}', 404));
    }
    res.status(204).send();
});

