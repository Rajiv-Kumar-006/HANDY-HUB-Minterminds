const express = require('express');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getCategories,
} = require('../controllers/serviceController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getServices);
router.get('/:id', optionalAuth, getServiceById);

// Admin-only routes
router.post('/', protect, authorize('admin'), upload.single('image'), createService);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.get('/categories', protect, authorize('admin'), getCategories);

module.exports = router;


// const express = require('express');
// const {
//   getAllServices,
//   getServiceById,
//   createService,
//   updateService,
//   deleteService,
//   getServiceCategories,
//   updateServicePopularity
// } = require('../controllers/serviceController');
// const { protect, authorize } = require('../middleware/auth');

// const router = express.Router();

// // Public routes
// router.get('/', getAllServices);
// router.get('/categories', getServiceCategories);
// router.get('/:id', getServiceById);

// // Protected routes (require authentication)
// router.use(protect);

// // Update service popularity (for booking tracking)
// router.put('/:id/popularity', updateServicePopularity);

// // Admin only routes
// router.use(authorize('admin'));

// router.post('/', createService);
// router.put('/:id', updateService);
// router.delete('/:id', deleteService);

// module.exports = router;
