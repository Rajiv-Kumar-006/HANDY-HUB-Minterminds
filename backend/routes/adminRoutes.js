const express = require('express');
const {
  getAdminDashboard,
  getAllUsers,
  getPendingWorkers,
  updateWorkerStatus,
  getAllBookings,
  getAllServices,
  createService,
  updateService,
  deleteService,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateService,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Users management
router.get('/users', validatePagination, getAllUsers);
router.put('/users/:id/status', validateObjectId, toggleUserStatus);

// Workers management
router.get('/workers/pending', validatePagination, getPendingWorkers);
router.put('/workers/:id/status', validateObjectId, updateWorkerStatus);

// Bookings management
router.get('/bookings', validatePagination, getAllBookings);

// Services management
router.get('/services', validatePagination, getAllServices);
router.post('/services', validateService, createService);
router.put('/services/:id', validateObjectId, validateService, updateService);
router.delete('/services/:id', validateObjectId, deleteService);

module.exports = router;