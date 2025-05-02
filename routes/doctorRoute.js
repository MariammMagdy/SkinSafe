const express = require("express");
const {
  createDoctorValidator,
  getDoctorValidator,
  updateDoctorValidator,
  deleteDoctorValidator,
} = require("../utils/validator/doctorValidator");

const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  uploadDoctorImage,
  resizeImage,
} = require("../services/doctorServices");

const authService = require("../services/authServices");
const reviewsRoute = require("./reviewRoute");

const router = express.Router();

// Nested route for reviews
router.use("/:doctorId/reviews", reviewsRoute);

// ---------------- PUBLIC ROUTES ----------------
router.route("/").get(getAllDoctors);

// ---------------- PROTECTED ROUTES ----------------

// Uncomment this if you want to apply protection globally
// router.use(authService.protect);

router.route("/").post(
  //authService.protect,
  //authService.allowedTo("admin", "manager"),
  uploadDoctorImage,
  resizeImage,
  createDoctorValidator,
  createDoctor
);

router
  .route("/:id")
  .get(getDoctorValidator, getDoctorById)
  .put(
    //authService.allowedTo("doctor", "manager"),
    uploadDoctorImage,
    resizeImage,
    updateDoctorValidator,
    updateDoctor
  )
  .delete(
    //authService.allowedTo("admin"),
    deleteDoctorValidator,
    deleteDoctor
  );

module.exports = router;
