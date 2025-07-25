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
  getWorkerStats,
  getMyBookings,
} = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

// Worker routes
router.post("/apply", authorize("user"), submitApplication);
router.post(
  "/documents",
  authorize("user"),
  upload.array("documents", 10), // Support up to 10 files
  uploadDocument
);
router.put("/submit", authorize("user"), submitForReview);
router.get("/me/stats", authorize("worker"), getWorkerStats);
router.get("/bookings/me", authorize("worker"), getMyBookings);
router
  .route("/me")
  .get(authorize("worker"), getMyApplication)
  .put(authorize("worker"), updateApplication);

// Admin routes
router.get("/", authorize("admin"), getAllApplications);
router.put("/:id/approve", authorize("admin"), approveApplication);
router.put("/:id/reject", authorize("admin"), rejectApplication);
router.delete("/:id", authorize("admin"), deleteApplication);

module.exports = router;