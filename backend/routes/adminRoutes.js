const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

// All routes below require admin authentication
router.use(protect);
router.use(restrictTo("admin"));

// ─── DASHBOARD ───────────────────────────────────────────────
// GET /api/admin/dashboard
router.get("/dashboard", adminController.getAdminDashboard);

//  ─── USERS ───────────────────────────────────────────────────
// GET /api/admin/users
router.get("/users", adminController.getAllUsers);
// PUT /api/admin/users/:id/status (activate/deactivate)
router.put("/users/:id/status", adminController.toggleUserStatus);
// ─── WORKER APPLICATIONS ─────────────────────────────────────
// GET /api/admin/worker-applications
router.get("/worker-applications", adminController.getAllWorkerApplications);
// PATCH /api/admin/worker-applications/:id/approve
router.patch(
  "/worker-applications/:id/approve",
  adminController.approveWorkerApplication
);
// PATCH /api/admin/worker-applications/:id/reject
router.patch(
  "/worker-applications/:id/reject",
  adminController.rejectWorkerApplication
);

// ─── WORKERS ─────────────────────────────────────────────────
// GET /api/admin/workers/pending
router.get("/workers/pending", adminController.getPendingWorkers);
// PUT /api/admin/workers/:id/status (approve/reject)
router.put("/workers/:id/status", adminController.updateWorkerStatus);
// ── BOOKINGS ────────────────────────────────────────────────
// GET /api/admin/bookings
router.get("/bookings", adminController.getAllBookings);

// ─── SERVICES ────────────────────────────────────────────────
// GET /api/admin/services
router.get("/services", adminController.getAllServices);
// POST /api/admin/services
router.post("/services", adminController.createService);
// PUT /api/admin/services/:id
router.put("/services/:id", adminController.updateService);
// DELETE /api/admin/services/:id
router.delete("/services/:id", adminController.deleteService);



module.exports = router;
