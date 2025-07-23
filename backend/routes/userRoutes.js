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



// const express = require('express');
// const {
//   getUserProfile,
//   updateUserProfile,
//   getUserDashboard,
//   updateUserLocation,
//   deleteUserAccount
// } = require('../controllers/userController');
// const { protect } = require('../middleware/auth');
// const { validateProfileUpdate } = require('../middleware/validation');

// const router = express.Router();

// // All routes are protected
// router.use(protect);
// // In user.routes.js
// router
//   .route("/:id")
//   .put(protect, authorize("admin"), updateUser);
// router.get('/profile', getUserProfile);
// router.put('/profile', validateProfileUpdate, updateUserProfile);
// router.get('/dashboard', getUserDashboard);
// router.put('/location', updateUserLocation);
// router.delete('/account', deleteUserAccount);

// module.exports = router;