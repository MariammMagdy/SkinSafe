const express = require("express");
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

router.use(protect);

router.get("/getMe", getLoggedUserData);

router.put(
  "/updateMe",
  updateUserValidator,
  uploadUserImage,
  resizeImage,
  updateUser
);

router.put("/deactivateMe", deactivateLoggedUser);
router.delete("/deleteMe", deleteLoggedUser);
router.put("/updateUserPassword", updateUserPassword);

//-------------------only for admin ---------------------
router.use(allowedTo("admin"));

router.put("/updateRole/:id", idUserValidator, updateUserRole);
router.put("/reactivate/:id", idUserValidator, reactivateUser);
router.get("/deactivated", getDeactivatedUsers);
router.get("/all", getAllUsers);
router.get("/getAdmins", getAllAdmins);
router.delete("/delete/:id", deleteUserAndAdmin);
router.get("/:id", idUserValidator, getUser);
router.post("/createAdmin", CreateAdmin);

module.exports = router;
