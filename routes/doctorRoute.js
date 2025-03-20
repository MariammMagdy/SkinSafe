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

//POST /doctors/fyuyfgyf/reviews
//GET /doctors/fyuyfgyf/reviews
//GET /doctors/fyuyfgyf/reviews/ttftfjj
router.use("/:doctorId/reviews", reviewsRoute);

router
  .route("/")
  .get(getAllDoctors)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadDoctorImage,
    resizeImage,
    createDoctorValidator,
    createDoctor
  );

router
  .route("/:id")
  .get(getDoctorValidator, getDoctorById)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadDoctorImage,
    resizeImage,
    updateDoctorValidator,
    updateDoctor
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteDoctorValidator,
    deleteDoctor
  );

module.exports = router;
