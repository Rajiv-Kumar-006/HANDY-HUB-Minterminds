const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  updateUserLocation,
  deleteUserAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', validateProfileUpdate, updateUserProfile);
router.get('/dashboard', getUserDashboard);
router.put('/location', updateUserLocation);
router.delete('/account', deleteUserAccount);

module.exports = router;