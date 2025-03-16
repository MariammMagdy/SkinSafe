const express = require('express');
const {
    createDoctorValidator,
    getDoctorValidator,
    updateDoctorValidator,
    deleteDoctorValidator
} = require("../utils/validator/doctorValidator");

const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    deleteDoctor,
    uploadDoctorImage,
    resizeImage,
} = require("../services/doctorServices");

const router = express.Router();

router
    .route('/')
    .post(createDoctorValidator, uploadDoctorImage, resizeImage, createDoctor)
    .get(getAllDoctors);
    
router
    .route('/:id')
    .get(getDoctorValidator, getDoctorById)
    .put(updateDoctorValidator, uploadDoctorImage, resizeImage, updateDoctor)
    .delete(deleteDoctorValidator, deleteDoctor);

module.exports = router;


