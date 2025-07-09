const express = require("express");
const {
  applyAsWorker,
  getApplicationStatus,
  getWorkerProfile,
  updateWorkerProfile,
  getWorkerDashboard,
  getAvailableWorkers,
  getWorkerPublicProfile,
  reapplyAsWorker,
} = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateWorkerApplication,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.get("/available", validatePagination, getAvailableWorkers);
router.get("/:id", validateObjectId, getWorkerPublicProfile);

// Protected routes - All users can check application status
router.get("/application/status", protect, getApplicationStatus);

// Protected routes - User can apply
router.post("/apply", protect, validateWorkerApplication, applyAsWorker);
router.post("/reapply", protect, validateWorkerApplication, reapplyAsWorker);

// Protected routes - Only approved workers
router.get("/profile/me", protect, authorize("worker"), getWorkerProfile);
router.put("/profile/me", protect, authorize("worker"), updateWorkerProfile);
router.get(
  "/dashboard/stats",
  protect,
  authorize("worker"),
  getWorkerDashboard
);

module.exports = router;


// const express = require('express');
// const {
//   submitWorkerApplication,
//   uploadDocuments,
//   submitForReview,
//   getWorkerApplication,
//   updateWorkerApplication,
//   getAllWorkers,
//   updateWorkerStatus,
//   getWorkerById
// } = require('../controllers/workerController');
// const { protect, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// const router = express.Router();

// // Public routes
// // None for workers

// // Protected routes (require authentication)
// router.use(protect);

// // Worker application routes
// router.post('/apply', submitWorkerApplication);
// router.post('/documents', upload.single('document'), uploadDocuments);
// router.put('/submit', submitForReview);
// router.get('/me', getWorkerApplication);
// router.put('/me', updateWorkerApplication);

// // Admin only routes
// router.use(authorize('admin'));

// router.get('/', getAllWorkers);
// router.get('/:id', getWorkerById);
// router.put('/:id/status', updateWorkerStatus);

// module.exports = router;
