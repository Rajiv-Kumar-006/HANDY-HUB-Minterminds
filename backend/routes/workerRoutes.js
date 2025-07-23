const express = require("express");
const router = express.Router();
const {
  submitApplication,
  uploadDocument,
  submitForReview,
  getMyApplication,
  updateApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
  deleteApplication,
} = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

// Worker routes
router.route("/apply").post(authorize("worker"), submitApplication);

router
  .route("/documents")
  .post(authorize("worker"), upload.single("document"), uploadDocument);

router.route("/submit").put(authorize("worker"), submitForReview);

router
  .route("/me")
  .get(authorize("worker"), getMyApplication)
  .put(authorize("worker"), updateApplication);

// Admin routes
router.route("/").get(authorize("admin"), getAllApplications);

router.route("/:id/approve").put(authorize("admin"), approveApplication);

router.route("/:id/reject").put(authorize("admin"), rejectApplication);

router.route("/:id").delete(authorize("admin"), deleteApplication);

module.exports = router;

