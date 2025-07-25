const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getCategories,
} = require("../controllers/serviceController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", optionalAuth, getServices);
router.get("/:id", optionalAuth, getServiceById);

// Admin-only routes
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  createService
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateService
);
router.delete("/:id", protect, authorize("admin"), deleteService);
router.get("/categories", protect, authorize("admin"), getCategories);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   createService,
//   getServices,
//   getServiceById,
//   updateService,
//   deleteService,
//   getCategories,
// } = require("../controllers/serviceController");
// const { protect, authorize, optionalAuth } = require("../middleware/auth");
// const upload = require("../middleware/upload");

// // Public routes
// router.get("/", optionalAuth, getServices);
// router.get("/:id", optionalAuth, getServiceById);

// // Admin-only routes
// router.post(
//   "/",
//   protect,
//   authorize("admin"),
//   upload.single("image"),
//   createService
// );
// router.put(
//   "/:id",
//   protect,
//   authorize("admin"),
//   upload.single("image"),
//   updateService
// );
// router.delete("/:id", protect, authorize("admin"), deleteService);
// router.get("/categories", protect, authorize("admin"), getCategories);

// module.exports = router;
