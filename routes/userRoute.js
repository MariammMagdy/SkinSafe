const express = require("express");
const userServices = require("../services/userServices");
const User = require("../models/userModel");
const {
  getUser,
  getLoggedUserData,
  getAllUsers,
  updateUser,
  updateUserRole,
  deactivateLoggedUser,
  reactivateUser,
  getDeactivatedUsers,
  deleteLoggedUser,
  getAllAdmins,
  deleteUserAndAdmin,
  CreateAdmin,
  updateUserPassword,
  resizeImage,
  uploadUserImage,
} = require("../services/userServices");

const {
  updateUserValidator,
  idUserValidator,
} = require("../utils/validator/userValidator");

const { protect, allowedTo } = require("../services/authServices");

const router = express.Router();

router.get("/all", getAllUsers);

router.use(protect);

router.post("/", userServices.createUser(User));
router.put(
  "/updateMe/:id",
  updateUserValidator,
  uploadUserImage,
  resizeImage,
  updateUser
);

router.get("/getMe/:id", getLoggedUserData);
router.put("/deactivateMe", deactivateLoggedUser);
router.put("/reactivateMe/:id", idUserValidator, reactivateUser);
router.delete("/deleteMe/:id", deleteLoggedUser);
router.put("/updateUserPassword", updateUserPassword);

//-------------------only for admin ---------------------
//router.use(allowedTo("admin"));

router.put("/updateRole/:id", idUserValidator, updateUserRole);
router.put("/reactivate/:id", idUserValidator, reactivateUser);
router.get("/deactivated", getDeactivatedUsers);
router.get("/getAdmins", getAllAdmins);
router.delete("/delete/:id", deleteUserAndAdmin);
router.get("/user/:id", idUserValidator, getUser);
router.post("/createAdmin", CreateAdmin);

module.exports = router;
