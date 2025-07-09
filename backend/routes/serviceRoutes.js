const express = require('express');
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  updateServicePopularity
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);

// Protected routes (require authentication)
router.use(protect);

// Update service popularity (for booking tracking)
router.put('/:id/popularity', updateServicePopularity);

// Admin only routes
router.use(authorize('admin'));

router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;







// const express = require('express');
// const {
//   getServices,
//   getService,
//   getServiceCategories,
//   getPopularServices,
//   searchServices
// } = require('../controllers/serviceController');
// const {
//   validateObjectId,
//   validatePagination
// } = require('../middleware/validation');

// const router = express.Router();

// // Public routes
// router.get('/', validatePagination, getServices);
// router.get('/categories', getServiceCategories);
// router.get('/popular', getPopularServices);
// router.get('/search', validatePagination, searchServices);
// router.get('/:id', validateObjectId, getService);

// module.exports = router;

