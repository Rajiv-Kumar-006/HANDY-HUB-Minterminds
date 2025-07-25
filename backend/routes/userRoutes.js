const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize, ownerOrAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/me")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

router
  .route("/")
  .get(protect, authorize("admin"), getAllUsers);

router
  .route("/:id")
  .put(protect, authorize("admin"), ownerOrAdmin("id"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
