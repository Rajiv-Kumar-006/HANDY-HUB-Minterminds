const express = require('express');
const {
  getServices,
  getService,
  getServiceCategories,
  getPopularServices,
  searchServices
} = require('../controllers/serviceController');
const {
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validatePagination, getServices);
router.get('/categories', getServiceCategories);
router.get('/popular', getPopularServices);
router.get('/search', validatePagination, searchServices);
router.get('/:id', validateObjectId, getService);

module.exports = router;